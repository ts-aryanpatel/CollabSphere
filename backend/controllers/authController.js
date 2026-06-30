import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { hashToken } from "../utils/hashToken.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


// @desc    Register a new user
// @route   POST /api/auth/signup
export const registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.validated.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new AppError('Email already registered', 400));
    }

    const user = await User.create({ name, email, password });

    return res
        .status(201)
        .json(new ApiResponse(201, { id: user._id, name: user.name, email: user.email }, "User registered successfully"));
});

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
export const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.validated.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
        return next(new AppError('Invalid email or password', 401));
    }

    const accessToken = generateToken(user, 'accessToken');
    const refreshToken = generateToken(user, 'refreshToken');

    user.refreshToken = hashToken(refreshToken);
    await user.save();

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    };

    return res
        .status(200)
        .cookie('refreshToken', refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: { id: user._id, name: user.name, email: user.email },
                    accessToken
                },
                'Login successful'
            )
        );
});

// @desc    Logout user & clear session / cookies with strict verification
// @route   POST /api/auth/logout
export const logoutUser = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return next(new AppError('No active session found or already logged out', 400));
    }

    const hashedToken = hashToken(refreshToken);

    const user = await User.findOne({ refreshToken: hashedToken });

    if (!user) {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        };
        res.clearCookie('refreshToken', cookieOptions);

        return next(new AppError('Invalid or expired session token', 401));
    }

    user.refreshToken = "";
    await user.save();

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    return res
        .status(200)
        .clearCookie('refreshToken', cookieOptions)
        .json(new ApiResponse(200, null, 'Logged out successfully'));
});

// @desc
// @route  POST /api/auth/refresh
export const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return next(new AppError('Refresh token missing, please login again', 401));
    }

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        return next(new AppError('Refresh token expired or invalid', 401));
    }

    const hashedToken = hashToken(refreshToken);

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== hashedToken) {
        return next(new AppError('Invalid session, token mismatch', 401));
    }

    const newAccessToken = generateToken(user, 'accessToken');
    const newRefreshToken = generateToken(user, 'refreshToken');

    const newHashedToken = hashToken(newRefreshToken);

    user.refreshToken = newHashedToken;
    await user.save();

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    }

    return res
        .status(200)
        .cookie('refreshToken', newRefreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { accessToken : newAccessToken },
                'Access token refreshed successfully'
            )
        );
});