
module.exports = (Schema) => {
    return new Schema({
        name: { type: String, default: '' },
        email: { type: String, default: '' },
        hash: { type: String, default: '' },
        salt: { type: String, default: '' }
    });
}