import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const validRoles = ["manager", "project_manager", "operator"];

    if (userRole && validRoles.includes(userRole)) {
      navigate(`/${userRole}`);
    } else {
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  return null;
};

export default Index;
