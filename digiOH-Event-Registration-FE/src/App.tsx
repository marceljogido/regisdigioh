import { MessageProvider } from "./context/MessageContext";
import { AuthProvider } from "./context/AuthContext";
import Routes from "./routes/routes";
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
    // return <Routes />;
    return (
        <AuthProvider>
            <MessageProvider>
                <Routes />
            </MessageProvider>
        </AuthProvider>
    )
};

export default App;
