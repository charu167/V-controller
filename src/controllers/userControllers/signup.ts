import { Request, Response, RequestHandler } from "express";
import prisma from "../../prisma";
import bcrypt from "bcrypt";
import {
  createAccessToken,
  createRefreshToken,
} from "../../services/tokenService";

// Interfaces
interface ReqBody {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
}

enum Role {
  CLIENT = "CLIENT",
  WORKER = "WORKER",
}

// ----------------------------------------------SIGNUP FUNCTION------------------------------------------------
export default async function signup(req: Request, res: Response) {
  const data = req.body as ReqBody;

  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      res.status(400).json({ message: "Email already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        roles: {
          create: [{ type: data.role }],
        },
      },

      include: {
        roles: true,
      },
    });

    // Generate tokens
    const accessToken = createAccessToken(newUser.id);
    const refreshToken = createRefreshToken(newUser.id);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        roles: newUser.roles.map((role) => role.type),
      },
      tokens: {
        access: accessToken,
        refresh: refreshToken,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
