
class Profile {
  constructor() {
    this.data = {
      progress: {},    // { "AC11.01": 3, ... }
      justifications: {} // { "AC11.01": "texte...", ... }
    };
    this.history = []; // Array of { date, code, oldLevel, newLevel }
    this.load();
  }

  /**
   * Charge les données depuis le localStorage
   */
  load() {
    const dataSaved = localStorage.getItem('skilltree-profile');
    if (dataSaved) {
      try {
        const parsed = JSON.parse(dataSaved);
        // Detection nouveau format
        if (parsed.history && Array.isArray(parsed.history)) {
          this.data = parsed.data || { progress: {}, justifications: {} };
          this.history = parsed.history;
        } else {
          // Ancien format compatibility
          this.data = {
            progress: parsed.progress || parsed || {},
            justifications: parsed.justifications || {}
          };
          this.history = [];
        }
      } catch (e) {
        console.error("Erreur chargement profil", e);
        this.data = { progress: {}, justifications: {} };
        this.history = [];
      }
    }
  }


  /**
   * Sauvegarde les données dans le localStorage
   */
  save() {
    const payload = {
      data: this.data,
      history: this.history
    };
    localStorage.setItem('skilltree-profile', JSON.stringify(payload));
  }

  /**
   * Récupère le niveau d'une AC
   * @param {string} code - Ex: "AC 11.01"
   * @returns {number} 0-5
   */
  getProgress(code) {
    return this.data.progress[code] || 0;
  }

  /**
   * Définit le niveau d'une AC
   * @param {string} code 
   * @param {number} level - 0-5
   */
  saveProgress(code, level) {
    const oldLevel = this.getProgress(code);
    if (oldLevel !== level) {
      this.data.progress[code] = level;

      this.history.unshift({
        date: new Date().toISOString(),
        code: code,
        oldLevel: oldLevel,
        newLevel: level
      });

      this.save();
    }
  }

  /**
   * Récupère la justification d'une AC
   * @param {string} code 
   * @returns {string}
   */
  getJustification(code) {
    return this.data.justifications[code] || '';
  }

  /**
   * Sauvegarde la justification d'une AC
   * @param {string} code 
   * @param {string} justification
   */
  saveJustification(code, justification) {
    this.data.justifications[code] = justification;
    this.save();
  }

  /**
   * Exporte les données en JSON
   */
  exportData() {
    const data = {
      progress: this.data.progress,
      justifications: this.data.justifications,
      history: this.history
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Importe les données depuis un JSON string
   */
  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);

      if (parsed && typeof parsed === 'object') {
        // Support du nouveau format { progress, justifications, history }
        if (parsed.progress !== undefined || parsed.justifications !== undefined) {
          this.data.progress = parsed.progress || {};
          this.data.justifications = parsed.justifications || {};
          this.history = Array.isArray(parsed.history) ? parsed.history : [];
        } else {
          // Fallback ancien format
          this.data.progress = parsed;
          this.data.justifications = {};
        }

        this.save();
        return true;
      }
    } catch (e) {
      console.error("Erreur import JSON", e);
    }
    return false;
  }

  /**
   * Exporte les données (pour download)
   */
  export() {
    const json = this.exportData();
    const jsonFile = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(jsonFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skilltree-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Récupère le progress (pour compatibilité)
   */
  get progress() {
    return this.data.progress;
  }

  /**
   * Récupère les justifications (pour compatibilité)
   */
  get justifications() {
    return this.data.justifications;
  }
}

export { Profile };
