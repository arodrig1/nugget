var Ride = function() {
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        _ObjectId = mongoose.Types.ObjectId,
        Driver = require('./driver.js'),
        Rider = require('./rider.js');

    var RideSchema = new Schema({
        from: { type: String, required: true },
        to: { type: String, required: true },
        date: { type: Date, required: true },
        time: { type: String, required: true },
        //driver: { type: _ObjectId, ref: 'Driver' },
        //rider: { type: _ObjectId, ref: 'Rider' },
        driverUsername: {type: String},
        riderUsername: {type: String, required: true},
        driver: {type: String},
        rider: {type: String, required: true},
        riderTel: {type: String},
        driverTel: {type: String}
    });

    var _model = mongoose.model('Ride', RideSchema);

    var _save = function (rideJSON, callback) {
        //ASSIGN DRIVER AND DRIVER USERNAME
        _model.create(rideJSON, callback);
    }

    var _findByDriverUsername = function (driver, callback) {
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        _model.find({ driverUsername: driver, date: { "$gte": yesterday } }).sort({ date: 'asc' }).sort({ time: 'asc' }).exec(callback);
    }

    var _findByRiderUsername = function (rider, callback) {
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        _model.find({ riderUsername: rider, date: { "$gte": yesterday } }).sort({ date: 'asc' }).sort({ time: 'asc' }).exec(callback);
    }

    var _findById = function (riderId, callback) {
        _model.findById(new _ObjectId(riderId)).exec(callback);
    }

    var _removeById = function (riderId, callback) {
        _model.remove({_id: new _ObjectId(riderId)}, callback);
    }

    var _updateById = function (riderId, riderJSON, callback) {
        //FIX SET
        _model.update({_id: riderId}, {'$set': {from: riderJSON.from, to:riderJSON.to, date:riderJSON['date'], time:riderJSON['time']}},{upsert:true}, callback);
    }

    return {
        schema: RideSchema,
        save: _save,
        findByDriverUsername: _findByDriverUsername,
        findByRiderUsername: _findByRiderUsername,
        findById: _findById,
        removeById: _removeById,
        updateById: _updateById
    };
}();

module.exports = Ride;
