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
    const { error } = await supabase.auth.signUp({ email, password });
    setMessage(error ? error.message : 'Registro exitoso. Verifica tu email.');
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? error.message : 'Inicio de sesión exitoso.');
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
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <h1>CRM App</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleSignUp}>Sign Up</button>

      <hr />

      <input type="file" onChange={handleFileUpload} />
      <button onClick={handleImport}>Importar Contactos</button>

      {message && <p>{message}</p>}

      <h2>Contactos</h2>
      <ul>
        {contacts.map((contact) => (
          <li key={contact.id}>{contact.nombre} - {contact.email}</li>
        ))}
      </ul>
    </div>
  );
}
