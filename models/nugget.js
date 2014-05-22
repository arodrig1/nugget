var Nugget = function() {
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        _ObjectId = mongoose.Types.ObjectId;

    var NuggetSchema = new Schema({
        firebase_id: { type: String, required: true },
        name: { type: String, required: false },
        from: { type: String, required: false },
        to: { type: String, required: true },
        ip_addr: { type: String, required: false }
    });

    var _model = mongoose.model('Nugget', NuggetSchema);

    var _save = function (nuggetJSON, callback) {
        _model.create(nuggetJSON, callback);
    }

    var _findByFirebaseId = function (nuggetId, callback) {
        _model.find({ firebase_id: nuggetId }).exec(callback);
    }

    return {
        schema: NuggetSchema,
        save: _save,
        findByFirebaseId: _findByFirebaseId
    };
}();

module.exports = Nugget;
