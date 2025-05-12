import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const { data, error } = await supabase.from('contacts').select('*');
    if (error) console.error(error);
    setContacts(data);
  };

  const handleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      setMessage(error ? error.message : 'Registro exitoso. Verifica tu email.');
    } catch (err) {
      console.error(err);
      setMessage('Error al registrarse.');
    }
  };

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setMessage(error ? error.message : 'Inicio de sesión exitoso.');
    } catch (err) {
      console.error(err);
      setMessage('Error al iniciar sesión.');
    }
  };

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!file) return setMessage('Selecciona un archivo');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const contacts = XLSX.utils.sheet_to_json(worksheet);

      try {
        const { error } = await supabase.from('contacts').insert(contacts);
        setMessage(error ? error.message : 'Contactos importados');
        fetchContacts();
      } catch (err) {
        console.error(err);
        setMessage('Error al importar contactos.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">CRM App - Estilo Pipedrive</h2>

        <div className="space-y-4 mb-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-between mb-6">
          <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg">Login</button>
          <button onClick={handleSignUp} className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg">Sign Up</button>
        </div>

        <hr className="mb-6" />

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Importar Contactos</h3>
          <input type="file" onChange={handleFileUpload} className="w-full p-2 border border-gray-300 rounded-lg mb-2" />
          <button onClick={handleImport} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg w-full">Importar</button>
        </div>

        {message && <p className="text-red-500 mb-6">{message}</p>}

        <h3 className="text-lg font-semibold mb-2">Contactos</h3>
        <div className="bg-gray-100 p-4 rounded-lg">
          {contacts.length > 0 ? (
            contacts.map((contact, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-300">
                <span>{contact.nombre} - {contact.email}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No hay contactos disponibles.</p>
          )}
        </div>
      </div>
    </div>
  );
}
