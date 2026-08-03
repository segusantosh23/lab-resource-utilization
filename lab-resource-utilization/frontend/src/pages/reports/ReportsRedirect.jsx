import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const ReportsRedirect = () => {

    const { user } = useContext(AuthContext);

    if (user?.role === "RESEARCHER") {
        return <Navigate to="/reports/researcher" replace />;
    }

    if (user?.role === "LAB_TECHNICIAN") {
        return <Navigate to="/reports/technician" replace />;
    }

    return <Navigate to="/" replace />;
};

export default ReportsRedirect;