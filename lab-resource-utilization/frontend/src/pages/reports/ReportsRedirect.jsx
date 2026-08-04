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

    if (user?.role === "LAB_MANAGER") {
        return <Navigate to="/reports/manager" replace />;
    }

    if (user?.role === "DEPARTMENT_HEAD") {
        return <Navigate to="/reports/department-head" replace />;
    }

    if (user?.role === "INSTITUTION_ADMIN") {
        return <Navigate to="/reports/institution-admin" replace />;
    }

    if (user?.role === "SYSTEM_ADMIN") {
        return <Navigate to="/reports/system-admin" replace />;
    }

    return <Navigate to="/" replace />;
};

export default ReportsRedirect;