// Library to track cpuUsage
const os = require('os-utils');
const rp  = require('request-promise');

// Library to send signal to Q keyboards
const q = require('daskeyboard-applet');

var url;

// Color associated to Sugar from low (green) to high (red).
const colors = ['#00FF00', '#00FF00', '#00FF00', '#00FF00', '#FFFF00', '#FFFF00', '#FF0000',
  '#FF0000', '#FF0000', '#FF0000'
];

const logger = q.logger;

class BloodSugar extends q.DesktopApp {
  constructor() {
    super();
    // run every 2.5 minutes or so...(glucose in the cloud is updated every 5 min)
    this.pollingInterval = 150000;
    logger.info("Nightscout Blood Sugar ready to go!");
  }

  // call this function every pollingInterval
  async run() {
    return this.getBloodSugar().then(val => {
      this.deleteOldSignals();

      //url = `${this.config.site}/api/v1/entries.json?count=1`;
      url = "https://hanselsugars.azurewebsites.net/api/v1/entries.json?count=1";
      console.log("URL is " + url);

      return new q.Signal({
        points: [this.generatePoints(val)],
        name: "Blood Sugar",
        message: Math.round(val * 100).toString(),
        isMuted: true, // don't flash the Q button on each signal
      });
    });
  }

  async getBloodSugar() {
    return new Promise((resolve) => {
       rp({
        method: 'GET',
        uri: "https://hanselsugars.azurewebsites.net/api/v1/entries.json",
        qs: {
          count: 1 
        },
        headers: { 'User-Agent': 'Request-Promise' },
        json: true
      })
      .then((sugar) => {
        var retVal = sugar[0].sgv;
        console.log(`Console retrieved ${retVal}`)
        logger.debug(`retrieved ${retVal}`);
        return resolve(retVal);
      })
      .catch(function(err){
        logger.debug(`ERROR: ${err}`);
      });
    })
  }

  /**
   * Delete all previous signals
   */
  async deleteOldSignals() {
    // delete the previous signals
    while (this.signalLog && this.signalLog.length) {
      const signal = this.signalLog.pop().signal;
      logger.debug(`Deleting previous signal: ${signal.id}`)
      await q.Signal.delete(signal).catch(error => {
        logger.error(`Error deleting signal ${signal.id}: ${error}`);
      });

      logger.debug(`Deleted the signal: ${signal.id}`);
    }
  }

  generatePoints(percent) {
    // multiply the percentage by the number total of keys 
    const numberOfKeysToLight = Math.round(this.getWidth() * percent);
    let points = [];

    // create a list of points (zones) with a color). Each point 
    // correspond to an LED
    for (let i = 0; i < numberOfKeysToLight; i++) {
      points.push(new q.Point(this.getColor(i)));
    }

    return points;
  }

  /** get a color of a zone depending on it's index on the zone array */
  getColor(zoneIndex) {
    if (zoneIndex >= colors.length) {
      // if the zone is after the number max of keys to light. Turn off the light
      // Black color = no light
      return '#000000';
    } else {
      // turn on the zone with the proper color
      return colors[zoneIndex];
    }
  }

  async shutdown() {
    await this.deleteOldSignals();
    await super.shutdown();    
  }
}

module.exports = {
  BloodSugar: BloodSugar
};

const bloodSugar = new BloodSugar();