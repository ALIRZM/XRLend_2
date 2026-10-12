const mongoose =require('mongoose');
const crypto= require('crypto');

const revokedTokenSchema = new mongoose.Schema({
    
    tokenHash: { type: String , required: true , unique: true },
    
    expiresAt: { type: Date , required: true, expires: 0 },
});

const hashToken= (token) => crypto.createHash('sha256').update(token).digest('hex');


revokedTokenSchema.statics.revoke= function (token, expiresAt) {
    const tokenHash =hashToken(token);
    return this.updateOne({ tokenHash }, { tokenHash, expiresAt }, { upsert: true });
};


revokedTokenSchema.statics.isRevoked = async function (token) {
    const found = await this.exists({ tokenHash: hashToken(token) });
    return Boolean(found);
};

module.exports =mongoose.model('RevokedToken' , revokedTokenSchema);