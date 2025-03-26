import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../../prisma";
import {
  createAccessToken,
  createRefreshToken,
} from "../../services/tokenService";

interface ReqBody {
  email: string;
  password: string;
}

export default async function signin(req: Request, res: Response) {
  const data = req.body as ReqBody;

  try {
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { roles: true }, // Fetch user roles
    });

    if (!user) {
       res.status(401).json({ message: "Invalid email or password" });
       return
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
       res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate tokens
    const accessToken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);

     res.status(200).json({
      message: "Sign-in successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles.map((role) => role.type),
      },
      tokens: {
        access: accessToken,
        refresh: refreshToken,
      },
    });
  } catch (error) {
    console.error("Signin Error:", error);
     res.status(500).json({ message: "Internal server error" });
  }
}
