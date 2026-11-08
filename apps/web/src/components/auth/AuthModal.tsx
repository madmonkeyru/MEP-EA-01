import { useState } from 'react';
import type { User } from '../../types';
import { storageService } from '../../services/storageService';
import { Dialog } from '../common/Dialog';
export function AuthModal({ isOpen, onClose, onUserChanged }: { isOpen: boolean; onClose: () => void; onUserChanged: (user: User | null) => void }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  if (!isOpen) return null;
  return <Dialog title="Perfil en este dispositivo" onClose={onClose}>
    <p>No necesitas una cuenta para estudiar. Un perfil local permite separar tu historial del modo invitado en este navegador.</p>
    <p className="muted">No usa contraseña, no verifica tu identidad y no sincroniza datos entre dispositivos. Borrar los datos del navegador elimina el historial local.</p>
    {!!storageService.getProfiles().length && <section><h3 className="font-semibold">Perfiles de este navegador</h3><p className="muted">Cualquier persona con acceso a este navegador puede seleccionar un perfil local.</p><div className="action-row">{storageService.getProfiles().map(profile => <button className="secondary-button" key={profile.id} onClick={() => { if (storageService.setCurrentUser(profile)) { onUserChanged(profile); onClose(); } else setError(storageService.lastError); }}>{profile.name}</button>)}</div></section>}
    <form className="form-stack" onSubmit={event => {
      event.preventDefault();
      if (!name.trim()) { setError('Escribe un nombre o apodo.'); return; }
      const user = { id: crypto.randomUUID(), name: name.trim(), email: '' };
      if (!storageService.setCurrentUser(user)) { setError('No fue posible guardar el perfil. Puedes continuar como invitado.'); return; }
      onUserChanged(user); onClose();
    }}>
      <label>Nombre o apodo<input autoComplete="nickname" maxLength={60} value={name} onChange={e => setName(e.target.value)} required /></label>
      {error && <p role="alert">{error}</p>}
      <button className="primary-button">Usar perfil local</button>
      <button type="button" className="secondary-button" onClick={onClose}>Continuar como invitado</button>
    </form>
  </Dialog>;
}
