import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import { Card, CardContent, Button, Input } from '@/components/ui';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase.from('contacts').select('*');
      if (error) throw error;
      setContacts(data);
    } catch (error) {
      console.log('Error fetching contacts:', error);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setMessage('Registro exitoso. Revisa tu correo para confirmar.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setMessage('Inicio de sesión exitoso.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
  };

  const handleImport = async () => {
    if (!file) {
      setMessage('No se ha seleccionado ningún archivo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const newContacts = XLSX.utils.sheet_to_json(worksheet);

      try {
        const { error } = await supabase.from('contacts').insert(newContacts);
        if (error) throw error;
        setMessage('Contactos importados con éxito.');
        fetchContacts();
      } catch (error) {
        setMessage(`Error al importar contactos: ${error.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
      setMessage('Contacto eliminado con éxito.');
      fetchContacts();
    } catch (error) {
      setMessage(`Error al eliminar contacto: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md mb-4">
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Iniciar Sesión / Registrarse</h2>
          <Input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-2"
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-2"
          />
          <Button onClick={handleLogin} className="w-full mb-2" disabled={loading}>Iniciar Sesión</Button>
          <Button onClick={handleSignUp} className="w-full" disabled={loading}>Registrarse</Button>
          <hr className="my-4" />
          <h2 className="text-lg font-bold mb-2">Importar Contactos</h2>
          <Input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="mb-2" />
          <Button onClick={handleImport} className="w-full" disabled={loading}>Importar</Button>
          {message && <p className="mt-2 text-red-500">{message}</p>}
        </CardContent>
      </Card>

      <Card className="w-full max-w-md">
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Lista de Contactos</h2>
          {contacts.length > 0 ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id} className="flex justify-between items-center mb-2">
                  <span>{contact.nombre} - {contact.email}</span>
                  <Button onClick={() => handleDelete(contact.id)} className="bg-red-500 text-white">Eliminar</Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay contactos disponibles.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
