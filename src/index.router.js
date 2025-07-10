import authRouter from "./modules/auth/auth.router.js";
import userRouter from "./modules/user/user.router.js";
import cors from "cors";
import morgan from "morgan";

export const bootstrap = (app, express) => {
  if (process.env.NODE_ENV == "dev") {
    app.use(morgan("common"));
  }

  app.use(cors());
  app.use(express.json());

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/users", userRouter);
};
