import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { ErrorMessage } from "../components/ErrorMessage";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginUser(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <ErrorMessage message={error} />
      <input className="w-full border rounded p-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full border rounded p-2" placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="w-full p-2 rounded bg-slate-900 text-white">Ingresar</button>
      <p className="text-sm text-center">¿No tenés cuenta? <Link className="text-blue-600" to="/register">Crear cuenta</Link></p>
    </form>
  );
};
