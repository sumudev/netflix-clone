import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const AVATARS = [
  "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150"
];

const UserProfile = ({ onSelectProfile }) => {
  const [profiles, setProfiles] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  // Load profiles from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('netflix_profiles');
      if (saved) {
        setProfiles(JSON.parse(saved));
      } else {
        // Create initial default profiles
        const defaults = [
          { id: '1', name: 'Dad', avatar: AVATARS[0] },
          { id: '2', name: 'Mom', avatar: AVATARS[2] },
          { id: '3', name: 'Kids', avatar: AVATARS[3] }
        ];
        setProfiles(defaults);
        localStorage.setItem('netflix_profiles', JSON.stringify(defaults));
      }
    } catch (e) {
      console.error("Failed to load profiles", e);
    }
  }, []);

  const handleAddProfile = (e) => {
    e.preventDefault();
    if (newName.trim() === '') return;

    const newProfile = {
      id: String(Date.now()),
      name: newName.trim(),
      avatar: selectedAvatar
    };

    const updated = [...profiles, newProfile];
    setProfiles(updated);
    localStorage.setItem('netflix_profiles', JSON.stringify(updated));

    // Reset inputs
    setNewName('');
    setIsAdding(false);
    setSelectedAvatar(AVATARS[0]);
  };

  const handleDeleteProfile = (id, e) => {
    e.stopPropagation(); // Avoid triggering profile selection on delete click
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    localStorage.setItem('netflix_profiles', JSON.stringify(updated));
  };

  return (
    <div className="profile-selection-screen">
      <div className="profile-container">
        {!isAdding ? (
          <>
            <h1 className="profile-heading">Who's watching?</h1>
            <div className="profile-grid">
              {profiles.map(profile => (
                <div 
                  key={profile.id} 
                  className="profile-card"
                  onClick={() => onSelectProfile(profile)}
                >
                  <div className="profile-avatar-wrapper">
                    <img src={profile.avatar} alt={profile.name} className="profile-avatar" />
                    {profiles.length > 1 && (
                      <button 
                        className="profile-delete-btn" 
                        onClick={(e) => handleDeleteProfile(profile.id, e)}
                        title="Delete Profile"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <span className="profile-name">{profile.name}</span>
                </div>
              ))}

              {profiles.length < 5 && (
                <div className="profile-card add-card" onClick={() => setIsAdding(true)}>
                  <div className="profile-avatar-wrapper add-wrapper">
                    <Plus size={40} className="add-icon" />
                  </div>
                  <span className="profile-name">Add Profile</span>
                </div>
              )}
            </div>
            <button className="manage-profiles-btn">Manage Profiles</button>
          </>
        ) : (
          <div className="add-profile-form">
            <h1 className="profile-heading">Add Profile</h1>
            <p className="profile-subheading">Add a profile for another person watching Netflix.</p>
            
            <form onSubmit={handleAddProfile}>
              <div className="form-row">
                <div className="selected-avatar-preview">
                  <img src={selectedAvatar} alt="Preview" />
                </div>
                
                <div className="form-inputs">
                  <input 
                    type="text" 
                    placeholder="Enter Profile Name" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    maxLength={12}
                    required
                    autoFocus
                  />
                  
                  <div className="avatar-selection-list">
                    <p>Choose an avatar:</p>
                    <div className="avatars-row">
                      {AVATARS.map((av, idx) => (
                        <img 
                          key={idx}
                          src={av} 
                          alt={`Avatar option ${idx}`} 
                          className={selectedAvatar === av ? 'active' : ''}
                          onClick={() => setSelectedAvatar(av)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-buttons">
                <button type="submit" className="profile-submit-btn">Save</button>
                <button 
                  type="button" 
                  className="profile-cancel-btn" 
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
