import { toUserResponse, type CreateUserRequest, type UserResponse } from "../model/user-model.js";
import { UserValidation } from "../validation/user-validation.js";
import { Validation } from "../validation/validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import bcrypt from "bcrypt";
import { da } from "zod/v4/locales";

export class UserService {
    static async register(request: CreateUserRequest): Promise<UserResponse> {
        const registerRequest = Validation.validate(UserValidation.REGISTER, request);

        const totalUserWithSameUsername = await prismaClient.user.count({
            where: { username: registerRequest.username }
        });

        if (totalUserWithSameUsername > 0) {
            throw new ResponseError(400, "Username is already taken");
        }

        registerRequest.password = await bcrypt.hash(registerRequest.password, 10);
        
        const user = await prismaClient.user.create({
            data: registerRequest
        });

        return toUserResponse(user);
    }
}