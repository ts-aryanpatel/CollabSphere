import jwt from "jsonwebtoken";

export const generateToken = (user, tokenType) => {

    let secret;
    let expiry;

    if (tokenType == "accessToken") {
        secret = process.env.ACCESS_TOKEN_SECRET;
        expiry = process.env.ACCESS_TOKEN_EXPIRY || '15m';
    } else if (tokenType == "refreshToken") {
        secret = process.env.REFRESH_TOKEN_SECRET;
        expiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
    } else {
        throw new Error("Invalid token type");
    }

    const payload = {
        id: user._id,
        email: user.email,
        name: user.name,
    };

    return jwt.sign(payload, secret, { expiresIn: expiry });
};