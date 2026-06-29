import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { hashToken } from "../utils/hashToken.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


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