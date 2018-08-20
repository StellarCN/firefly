import { getErrorMessage, logMessage, } from './helpers';
var DataPulseProvider = /** @class */ (function () {
    function DataPulseProvider(historyProvider, updateFrequency) {
        this._subscribers = {};
        this._requestsPending = 0;
        this._lastStartTime = -1;
        this._historyProvider = historyProvider;
        console.log('------------------sequence:' + updateFrequency);
        this._interval = setInterval(this._updateData.bind(this), updateFrequency);
    }
    DataPulseProvider.prototype.clearInterval = function () {
        this._lastStartTime = -1;
        if (this._interval) {
            clearInterval(this._interval);
        }
    };
    DataPulseProvider.prototype.subscribeBars = function (symbolInfo, resolution, newDataCallback, listenerGuid) {
        if (this._subscribers.hasOwnProperty(listenerGuid)) {
            logMessage("DataPulseProvider: already has subscriber with id=" + listenerGuid);
            return;
        }
        this._subscribers[listenerGuid] = {
            lastBarTime: null,
            listener: newDataCallback,
            resolution: resolution,
            symbolInfo: symbolInfo,
        };
        logMessage("DataPulseProvider: subscribed for #" + listenerGuid + " - {" + symbolInfo.name + ", " + resolution + "}");
    };
    DataPulseProvider.prototype.unsubscribeBars = function (listenerGuid) {
        delete this._subscribers[listenerGuid];
        logMessage("DataPulseProvider: unsubscribed for #" + listenerGuid);
    };
    DataPulseProvider.prototype._updateData = function () {
        var _this = this;
        if (this._requestsPending > 0) {
            return;
        }
        this._requestsPending = 0;
        var _loop_1 = function (listenerGuid) {
            this_1._requestsPending += 1;
            this_1._updateDataForSubscriber(listenerGuid)
                .then(function () {
                _this._requestsPending -= 1;
                logMessage("DataPulseProvider: data for #" + listenerGuid + " updated successfully, pending=" + _this._requestsPending);
            })
                .catch(function (reason) {
                _this._requestsPending -= 1;
                logMessage("DataPulseProvider: data for #" + listenerGuid + " updated with error=" + getErrorMessage(reason) + ", pending=" + _this._requestsPending);
            });
        };
        var this_1 = this;
        for (var listenerGuid in this._subscribers) {
            _loop_1(listenerGuid);
        }
    };
    DataPulseProvider.prototype._updateDataForSubscriber = function (listenerGuid) {
        var _this = this;
        var subscriptionRecord = this._subscribers[listenerGuid];
        var endTime, startTime;
        endTime = parseInt((Date.now() / 1000).toString());
        if (this._lastStartTime < 0) {
            startTime = endTime - periodLengthSeconds(subscriptionRecord.resolution, 100);
        }
        else {
            startTime = this._lastStartTime;
        }
        var seconds = resolutionToSeconds(subscriptionRecord.resolution);
        if (endTime - startTime < seconds) {
            logMessage("\u4E0D\u5230\u4E00\u4E2A\u5468\u671F\uFF0C\u4E0D\u518D\u8BF7\u6C42\u8BBF\u95EE\u6570\u636E\uFF01");
            return Promise.reject("unavaiable");
        }
        this._lastStartTime = endTime;
        console.log('----resolution - p:-' + periodLengthSeconds(subscriptionRecord.resolution, 100));
        // const rangeEndTime = parseInt((Date.now() / 1000).toString());
        // BEWARE: please note we really need 2 bars, not the only last one
        // see the explanation below. `10` is the `large enough` value to work around holidays
        // const rangeStartTime = rangeEndTime - periodLengthSeconds(subscriptionRecord.resolution, 10);
        console.log("----read history---resolution:" + subscriptionRecord.resolution + " - startTime:" + startTime + ",--endTime:" + endTime + "---");
        return this._historyProvider.getBars(subscriptionRecord.symbolInfo, subscriptionRecord.resolution, startTime, endTime)
            .then(function (result) {
            _this._onSubscriberDataReceived(listenerGuid, result);
        });
    };
    DataPulseProvider.prototype._onSubscriberDataReceived = function (listenerGuid, result) {
        // means the subscription was cancelled while waiting for data
        if (!this._subscribers.hasOwnProperty(listenerGuid)) {
            logMessage("DataPulseProvider: Data comes for already unsubscribed subscription #" + listenerGuid);
            return;
        }
        var bars = result.bars;
        if (bars.length === 0) {
            return;
        }
        var lastBar = bars[bars.length - 1];
        var subscriptionRecord = this._subscribers[listenerGuid];
        if (subscriptionRecord.lastBarTime !== null && lastBar.time < subscriptionRecord.lastBarTime) {
            return;
        }
        var isNewBar = subscriptionRecord.lastBarTime !== null && lastBar.time > subscriptionRecord.lastBarTime;
        // Pulse updating may miss some trades data (ie, if pulse period = 10 secods and new bar is started 5 seconds later after the last update, the
        // old bar's last 5 seconds trades will be lost). Thus, at fist we should broadcast old bar updates when it's ready.
        if (isNewBar) {
            if (bars.length < 2) {
                throw new Error('Not enough bars in history for proper pulse update. Need at least 2.');
            }
            var previousBar = bars[bars.length - 2];
            subscriptionRecord.listener(previousBar);
        }
        subscriptionRecord.lastBarTime = lastBar.time;
        subscriptionRecord.listener(lastBar);
    };
    return DataPulseProvider;
}());
export { DataPulseProvider };
function periodLengthSeconds(resolution, requiredPeriodsCount) {
    var daysCount = 0;
    if (resolution === 'D' || resolution === '1D') {
        daysCount = requiredPeriodsCount;
    }
    else if (resolution === 'M' || resolution === '1M') {
        daysCount = 31 * requiredPeriodsCount;
    }
    else if (resolution === 'W' || resolution === '1W') {
        daysCount = 7 * requiredPeriodsCount;
    }
    else {
        daysCount = requiredPeriodsCount * parseInt(resolution) / (24 * 60);
    }
    return daysCount * 24 * 60 * 60;
}
/**
 *
 * @param resolution 周期
 */
function resolutionToSeconds(resolution) {
    var millis = 0;
    if (resolution === 'D' || resolution === '1D') {
        millis = 86400;
    }
    else if (resolution === 'M' || resolution === '1M') {
        millis = 2678400;
    }
    else if (resolution === 'W' || resolution === '1W') {
        millis = 604800;
    }
    else {
        millis = parseInt(resolution);
    }
    return millis;
}
