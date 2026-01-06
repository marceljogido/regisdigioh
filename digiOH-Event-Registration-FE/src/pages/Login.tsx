import { motion } from 'framer-motion';
import LoginForm from "../components/LoginForm";
const digiohTitle = require("../assets/digioh-title.svg").default as string;
const loginImage = require("../assets/login-images.svg").default as string;

const pageVariants = {
    initial: {
        opacity: 0,
        y: -50,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
        },
    },
    exit: {
        opacity: 0,
        y: 50,
        transition: {
            duration: 0.5,
        },
    },
};

const Login = () => {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className="relative flex flex-col md:flex-row items-center justify-center h-screen w-full bg-gray-100"
        >
            <img src={digiohTitle} className="absolute top-0 left-0 w-32 md:w-40 lg:w-48 xl:w-56 m-4" alt="DigiOH Title" />

            <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="hidden md:flex md:w-1/2 items-center justify-center"
            >
                <img src={loginImage} className="max-w-[100%] md:max-w-[90%] lg:max-w-[100%] xl:max-w-[80%] m-4" alt="Login" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full md:w-1/2 flex flex-col items-center justify-center p-6"
            >
                <LoginForm />
            </motion.div>
        </motion.div>
    );
};

export default Login;
