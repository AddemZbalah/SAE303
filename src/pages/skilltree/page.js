import { htmlToDOM } from "@/lib/utils.js";
import template from "@/ui/skilltree/template.html?raw";
import acDetailsTemplate from "@/ui/skilltree/template_ac_details.html?raw";
import historiqueTemplate from "@/ui/skilltree/template_historique.html?raw";
import { Animation } from "@/lib/animation.js";
import { RadarChartView } from "@/ui/radar-chart/index.js";
import { pn } from "@/lib/pn.js";
import { Profile } from "@/data/profile.js";

let M = {
  dataAC: null,
  profile: null,
  temporalProgress: null, // État du voyage dans le temps
  temporalStepsBack: 0,   // Nombre d'étapes de retour en arrière

  init: async function () {
    this.profile = new Profile();
  },

  /**
   * Trouve les infos d'une AC par son code (ex: "AC 11.01")
   * Retourne l'objet AC ainsi que son contexte (Niveau, Compétence)
   */
  getInfosAC: function (code) {
    return pn.getInfos(code);
  }
};

let C = {};

C.init = function () {
  M.init();
  return V.init();
}

C.handleToggleSidebar = function (sidebar, toggleIcon) {
  sidebar.classList.toggle('-translate-x-full');
  toggleIcon.classList.toggle('rotate-180');
}

C.handleACNodeClick = function (acCode) {
  V.showACModal(acCode);
}

C.handleOpenHistorique = function () {
  V.showHistoriqueModal();
}

C.export = function () {
  M.profile.export();
}

C.updateIndicators = function (indicators, level, color) {
  const indicatorLevels = [0, 0, 1, 1, 2];
  const activeIndex = level > 0 ? indicatorLevels[level - 1] : -1;

  indicators.forEach((ind, index) => {
    // Suppression de l'attribut style pour n'utiliser que les classes CSS (demande utilisateur)
    ind.removeAttribute('style');

    const strong = ind.querySelector('strong');
    if (strong) strong.removeAttribute('style');

    const span = ind.querySelector('span');
    if (span) span.removeAttribute('style');

    if (index === activeIndex) {
      ind.classList.add('indicator-active');
    } else {
      ind.classList.remove('indicator-active');
    }

    // Ensure data-color is set for CSS targeting
    ind.dataset.color = color.name;
  });
};

C.handleLevelButtonClick = function (level, acCode, modalContainer, color, acNode) {
  M.profile.saveProgress(acCode, level);

  // Si on modifie un niveau, on sort du mode "Voyage dans le temps" pour revenir à la réalité
  M.temporalProgress = null;
  M.temporalStepsBack = 0;

  if (V.rootPage) {
    V.updateProgressionGlobale();
  }
  const levelButtons = modalContainer.querySelectorAll('.level-btn');
  const indicators = modalContainer.querySelectorAll('.indicator-box');
  const progressBar = modalContainer.querySelector('.progress-bar');
  const levelDisplay = modalContainer.querySelector('.level-display');
  const ellipseExterne = acNode?.querySelector('circle');
  const circumference = 288;

  levelButtons.forEach(b => {
    b.classList.remove('level-btn-active');
    b.classList.remove('level-btn-selected');
  });

  C.updateIndicators(indicators, level, color);

  // Ajouter la classe active au bouton cliqué
  if (levelButtons[level]) {
    levelButtons[level].classList.add('level-btn-active');
  }

  levelButtons[level].textContent = level;
  progressBar.dataset.percentage = (level / 5) * 100;
  Animation.animateLevelSelection(levelButtons[level], progressBar, color.hex);
  levelDisplay.textContent = level + '/5';

  if (ellipseExterne) {
    const dashoffset = circumference - (level / 5) * circumference;
    Animation.animateProgressCircle(ellipseExterne, dashoffset);
  }
}

C.handleCloseModal = function (modalContainer) {
  modalContainer.classList.add('hidden');
  modalContainer.classList.remove('flex');
}

let V = {
  rootPage: null,
  radarChart: null
};

V.init = function () {
  let fragment = V.createPageFragment();
  V.attachEvents(fragment);
  return fragment;
};

V.createPageFragment = function () {
  V.rootPage = htmlToDOM(template);

  // Initialisation du Radar Chart (Modal)
  V.radarChart = new RadarChartView();
  V.rootPage.appendChild(V.radarChart.dom());

  V.setupLaserAnimations();
  V.animateSkiltreeTraits();
  V.setupFloatingAnimation();
  V.updateProgressionGlobale();
  V.initializeACCircles();
  return V.rootPage;
};

V.attachEvents = function (pageFragment) {
  V.setupToggle();
  V.setupMenuBurger();
  V.setupACNodesHover();
  V.setupHistoriqueModal();
  V.setupCanvasInteractions();
  V.setupLevelFilters();
  V.setupRadarToggle();
  return pageFragment;
};

V.setupRadarToggle = function () {
  const toggleBtn = V.rootPage.querySelector('#radar-toggle-btn');
  const closeBtn = V.radarChart.getCloseButton();
  const modal = V.radarChart.getContainer();

  if (toggleBtn && modal) {
    toggleBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });
  }

  // Fermer au clic sur le backdrop
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    });
  }
};

V.initializeACCircles = function (customProgress = null) {
  const colorMap = {
    'c1': 'var(--st-comprendre)',
    'c2': 'var(--st-concevoir)',
    'c3': 'var(--st-exprimer)',
    'c4': 'var(--st-developper)',
    'c5': 'var(--st-entreprendre)'
  };

  const progressSource = customProgress || M.temporalProgress || M.profile.progress;

  for (let i = 0; i < pn.length; i++) {
    const comp = pn[i];
    const colorHex = colorMap[comp.couleur];

    if (comp.niveaux) {
      comp.niveaux.forEach(niveau => {
        niveau.acs.forEach(ac => {
          const acNode = V.rootPage.querySelector(`[id="${ac.code}"]`);
          if (!acNode) return;

          const ellipseExterne = acNode.querySelector('circle');
          if (!ellipseExterne) return;

          const progress = progressSource[ac.code] || 0;
          const circumference = 288;
          const dashoffset = circumference - (progress / 5) * circumference;

          // Utilisation de GSAP pour la synchronisation fluide si c'est un changement dynamique
          if (customProgress) {
            Animation.animateProgressCircle(ellipseExterne, dashoffset);
          } else {
            ellipseExterne.setAttribute('stroke-dasharray', circumference);
            ellipseExterne.setAttribute('stroke-dashoffset', dashoffset);
          }
          ellipseExterne.setAttribute('stroke', colorHex);
        });
      });
    }
  }
};

V.updateProgressionGlobale = function (customProgress = null) {
  const competenceMap = {
    'c1': 'comprendre',
    'c2': 'concevoir',
    'c3': 'exprimer',
    'c4': 'developper',
    'c5': 'entreprendre'
  };

  const competences = {
    comprendre: [],
    concevoir: [],
    exprimer: [],
    developper: [],
    entreprendre: []
  };

  const progressSource = customProgress || M.temporalProgress || M.profile.progress;

  for (let i = 0; i < pn.length; i++) {
    const comp = pn[i];
    const competenceName = competenceMap[comp.couleur];

    if (comp.niveaux && competenceName) {
      comp.niveaux.forEach(niveau => {
        niveau.acs.forEach(ac => {
          const progress = progressSource[ac.code] || 0;
          const percentage = (progress / 5) * 100;
          competences[competenceName].push(percentage);
        });
      });
    }
  }

  for (let key in competences) {
    const arr = competences[key];
    let total = 0;
    for (let i = 0; i < arr.length; i++) {
      total += arr[i];
    }
    const avg = arr.length > 0 ? Math.round(total / arr.length) : 0;

    const li = V.rootPage.querySelector(`li[data-competence="${key}"]`);
    if (li) {
      const percentageText = li.querySelector('.progress-percentage');
      const barFill = li.querySelector('.progress-bar-fill');

      if (percentageText) percentageText.textContent = avg + '%';
      if (barFill) Animation.animateProgressBarre(barFill, avg);
    }
  }

  // Mettre à jour le Radar Chart
  if (V.radarChart) {
    const radarValues = [
      competences.comprendre.length > 0 ? Math.round(competences.comprendre.reduce((a, b) => a + b, 0) / competences.comprendre.length) : 0,
      competences.concevoir.length > 0 ? Math.round(competences.concevoir.reduce((a, b) => a + b, 0) / competences.concevoir.length) : 0,
      competences.exprimer.length > 0 ? Math.round(competences.exprimer.reduce((a, b) => a + b, 0) / competences.exprimer.length) : 0,
      competences.developper.length > 0 ? Math.round(competences.developper.reduce((a, b) => a + b, 0) / competences.developper.length) : 0,
      competences.entreprendre.length > 0 ? Math.round(competences.entreprendre.reduce((a, b) => a + b, 0) / competences.entreprendre.length) : 0
    ];
    Animation.updateRadarChart(V.radarChart.getPolygon(), radarValues);
  }
};

V.setupToggle = function () {
  const sidebar = V.rootPage.querySelector('#sidebar');
  const toggleButton = V.rootPage.querySelector('#sidebar-toggle');
  const toggleIcon = V.rootPage.querySelector('#toggle-icon');

  if (toggleButton && sidebar && toggleIcon) {
    toggleButton.addEventListener('click', () => C.handleToggleSidebar(sidebar, toggleIcon));
  }
};

V.setupMenuBurger = function () {
  const burgerBtn = V.rootPage.querySelector('#menu-burger-btn');
  const burgerIcon = V.rootPage.querySelector('#menu-burger-icon');
  const closeIcon = V.rootPage.querySelector('#menu-close-icon');
  const dropdown = V.rootPage.querySelector('#menu-dropdown');

  if (burgerBtn && dropdown && burgerIcon && closeIcon) {
    // Toggle menu et changer l'icône
    burgerBtn.addEventListener('click', () => {
      dropdown.classList.toggle('hidden');
      dropdown.classList.toggle('flex');
      burgerIcon.classList.toggle('hidden');
      closeIcon.classList.toggle('hidden');
    });
  }
};

V.setupLevelFilters = function () {
  const filterButtons = V.rootPage.querySelectorAll('.level-filter-btn');
  const resetButton = V.rootPage.querySelector('#level-filter-reset');
  const allACNodes = V.rootPage.querySelectorAll('g[id^="AC "]');
  const allTraitGroups = V.rootPage.querySelectorAll('g[id^="traits_"]');

  // Bouton RESET
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      Animation.resetAllFilters(allACNodes, allTraitGroups);

      // Ajouter l'animation bounce à tous les nœuds
      allACNodes.forEach(node => {
        node.classList.add('pulse-effect');
        Animation.bounce(node, 0.8, 30);
      });

      // Fade in tous les traits
      Animation.fadeInTraits(allTraitGroups, 0.3);
    });
  }

  // Boutons de filtre par niveau
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const level = parseInt(btn.dataset.level);

      // Séparer les nœuds à afficher et à masquer
      const nodesToShow = [];
      const nodesToHide = [];

      allACNodes.forEach(node => {
        const acCode = node.getAttribute('id');
        const levelIndex = pn.getLevelIndex(acCode) - 1;

        if (levelIndex + 1 === level) {
          nodesToShow.push(node);
          node.classList.add('pulse-effect');
          Animation.bounce(node, 0.8, 30);
        } else {
          nodesToHide.push(node);
          node.classList.remove('pulse-effect');
        }
      });

      // Séparer les traits à afficher et à masquer
      const traitsToShow = [];
      const traitsToHide = [];

      allTraitGroups.forEach(traitGroup => {
        const groupId = traitGroup.id;
        const isLevelGroup = groupId.match(/traits_\w+_niv(\d)/);

        if (isLevelGroup) {
          const groupLevel = parseInt(isLevelGroup[1]);

          if (groupLevel === level) {
            traitsToShow.push(traitGroup);
          } else {
            traitsToHide.push(traitGroup);
          }
        }
      });

      // Animer les nœuds
      if (nodesToShow.length > 0) {
        Animation.fadeInACNodes(nodesToShow, 0.3);
      }
      if (nodesToHide.length > 0) {
        Animation.fadeOutACNodes(nodesToHide, 0.5);
      }

      // Animer les traits
      if (traitsToShow.length > 0) {
        Animation.fadeInTraits(traitsToShow, 0.3);
      }
      if (traitsToHide.length > 0) {
        Animation.fadeOutTraits(traitsToHide, 0.5);
      }
    });
  });
};

V.setupLaserAnimations = function () {
  const laserRect1 = V.rootPage.querySelector('.laser-rect');
  const laserRect2 = V.rootPage.querySelector('.laser-rect-2');
  Animation.animateLaserBorders(laserRect1, laserRect2);
};

V.animateSkiltreeTraits = function () {

  const traitGroups = V.rootPage.querySelectorAll('[id^="traits_"]');

  traitGroups.forEach(group => {
    const lines = group.querySelectorAll('line, path');
    if (lines.length > 0) {
      Animation.drawLine(lines, [], 2);
      Animation.animateLaserOnLines(lines, 4);
    }
  });


  const mainTraitsGroup = V.rootPage.querySelector('#ARBRE_UE_PRINCIPALE');

  if (mainTraitsGroup) {
    const lines = mainTraitsGroup.querySelectorAll('line, path');

    if (lines.length > 0) {
      Animation.drawLine(lines, [], 2);
      Animation.animateLaserOnLines(lines, 4);
    }
  }
};

V.setupFloatingAnimation = function () {
  const ueNodes = [
    V.rootPage.querySelector('#COMPRENDRE'),
    V.rootPage.querySelector('#CONCEVOIR'),
    V.rootPage.querySelector('#EXPRIMER'),
    V.rootPage.querySelector('#DEVELOPPER'),
    V.rootPage.querySelector('#ENTREPRENDRE')
  ];
  Animation.startFloatingAnimation(ueNodes);
};

V.setupACNodesHover = function () {
  const allACNodes = V.rootPage.querySelectorAll('g[id^="AC "]');

  allACNodes.forEach(node => {
    node.style.cursor = 'pointer';
    node.addEventListener('mouseenter', () => Animation.bounce(node, 0.6, 20));
    node.addEventListener('click', () => C.handleACNodeClick(node.getAttribute('id')));
  });
};

V.setupCanvasInteractions = function () {
  const svg = V.rootPage.querySelector('#main-area figure svg #arbre_de_competences_pour_svg');
  const mainArea = V.rootPage.querySelector('#main-area');
  if (!svg || !mainArea) return;

  Animation.initCanvas(svg);

  let isDragging = false;
  let startX = 0;
  let startY = 0;

  mainArea.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    mainArea.style.cursor = 'grabbing';
  });

  mainArea.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = (e.clientX - startX) * 3;
    const deltaY = (e.clientY - startY) * 3;
    Animation.moveCanvas(svg, deltaX, deltaY);
    startX = e.clientX;
    startY = e.clientY;
  });

  mainArea.addEventListener('mouseup', () => {
    isDragging = false;
    mainArea.style.cursor = 'default';
  });

  mainArea.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = mainArea.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    Animation.zoomCanvas(svg, e.deltaY, mouseX, mouseY);
  });
};

V.setupLevelButtons = function (modalContainer, color, acNode, acCode) {
  const levelButtons = modalContainer.querySelectorAll('.level-btn');
  const progressBar = modalContainer.querySelector('.progress-bar');
  const levelDisplay = modalContainer.querySelector('.level-display');
  const indicators = modalContainer.querySelectorAll('.indicator-box');
  const justificatifTextarea = modalContainer.querySelector('.justificatif-textarea');
  const importBtn = modalContainer.querySelector('.import-justificatif-btn');
  const fileInput = modalContainer.querySelector('.justificatif-file-input');
  const ellipseExterne = acNode?.querySelector('circle');

  // Utiliser le progress temporel si on est en voyage dans le temps
  const currentLevel = (M.temporalProgress ? M.temporalProgress[acCode] : M.profile.progress[acCode]) || 0;

  const circumference = 288;

  // Charger la justification existante
  if (justificatifTextarea) {
    justificatifTextarea.value = M.profile.getJustification(acCode);

    // Sauvegarder la justification à chaque changement
    justificatifTextarea.addEventListener('input', () => {
      M.profile.saveJustification(acCode, justificatifTextarea.value);
    });
  }

  // Gestion du bouton import
  if (importBtn && fileInput && justificatifTextarea) {
    importBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          justificatifTextarea.value = event.target.result;
          M.profile.saveJustification(acCode, event.target.result);

          // Confirmation visuelle
          const originalText = importBtn.textContent;
          importBtn.textContent = '✓ Importé';
          importBtn.classList.add('bg-green-700');
          importBtn.classList.remove('bg-slate-700', 'hover:bg-slate-600');

          setTimeout(() => {
            importBtn.textContent = originalText;
            importBtn.classList.remove('bg-green-700');
            importBtn.classList.add('bg-slate-700', 'hover:bg-slate-600');
          }, 2000);
        };
        reader.readAsText(file);
      }
    });
  }

  if (ellipseExterne) {
    ellipseExterne.style.strokeDasharray = circumference;
    ellipseExterne.style.stroke = color.hex;
    const initialDashoffset = circumference - (currentLevel / 5) * circumference;
    ellipseExterne.style.strokeDashoffset = initialDashoffset;
  }

  // Assigner les data-color d'abord
  levelButtons.forEach(btn => btn.dataset.color = color.name);
  indicators.forEach(ind => ind.dataset.color = color.name);

  if (currentLevel > 0) {
    progressBar.style.width = (currentLevel / 5) * 100 + '%';
    levelDisplay.textContent = currentLevel + '/5';

    if (levelButtons[currentLevel]) {
      levelButtons[currentLevel].classList.add('level-btn-active');
      levelButtons[currentLevel].textContent = currentLevel;
    }

    C.updateIndicators(indicators, currentLevel, color);
  }

  levelButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => C.handleLevelButtonClick(index, acCode, modalContainer, color, acNode));
  });
};

V.setupHistoriqueModal = function () {
  const historiqueModal = htmlToDOM(historiqueTemplate);
  V.rootPage.appendChild(historiqueModal);

  const historiqueButton = V.rootPage.querySelector('#historique-btn');
  if (historiqueButton) {
    historiqueButton.addEventListener('click', () => C.handleOpenHistorique());
  }

  const exportButton = V.rootPage.querySelector('#export-btn');
  if (exportButton) {
    exportButton.addEventListener('click', () => {
      M.profile.export();
    });
  }

  const importBtn = V.rootPage.querySelector('#import-btn');
  const importInput = V.rootPage.querySelector('#import-input');

  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => {
      importInput.click();
    });

    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        const success = M.profile.importData(content);
        if (success) {
          alert('Importation réussie ! La page va se recharger.');
          window.location.reload();
        } else {
          alert('Erreur lors de l\'importation. Vérifiez le format du fichier.');
        }
      };
      reader.readAsText(file);
    });
  }
};

V.showHistoriqueModal = function () {
  const modalContainer = V.rootPage.querySelector('#historique-modal');
  const historiqueList = modalContainer.querySelector('#historique-list');
  const historiqueEmpty = modalContainer.querySelector('#historique-empty');
  const sliderContainer = modalContainer.querySelector('#historique-slider-container');
  const slider = modalContainer.querySelector('#historique-slider');

  const history = M.profile.history;

  if (history.length === 0) {
    historiqueList.innerHTML = '';
    historiqueEmpty.classList.remove('hidden');
    sliderContainer.classList.add('hidden');
  } else {
    historiqueEmpty.classList.add('hidden');
    sliderContainer.classList.remove('hidden');

    // Configurer le slider
    slider.max = history.length;
    slider.value = M.temporalStepsBack || 0;
    const sliderStatus = modalContainer.querySelector('#slider-status');

    if (sliderStatus) {
      if (M.temporalStepsBack > 0) {
        sliderStatus.textContent = `Retour de ${M.temporalStepsBack} étape(s)`;
      } else {
        sliderStatus.textContent = "État actuel";
      }
    }

    const colorMap = {
      'c1': { name: 'COMPRENDRE', color: 'blue' },
      'c2': { name: 'CONCEVOIR', color: 'yellow' },
      'c3': { name: 'EXPRIMER', color: 'red' },
      'c4': { name: 'DEVELOPPER', color: 'green' },
      'c5': { name: 'ENTREPRENDRE', color: 'purple' }
    };

    const entryTemplate = modalContainer.querySelector('#historique-entry-template');
    historiqueList.innerHTML = '';

    history.forEach((entry, index) => {
      const skillIndex = pn.getSkillIndex(entry.code) - 1;
      const competence = pn[skillIndex];
      const competenceInfo = colorMap[competence.couleur];
      const acShortCode = entry.code.slice(3, 8).replace('.', '');

      const now = Date.now();
      const timestamp = new Date(entry.date).getTime();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      let timeAgo;
      if (minutes < 1) {
        timeAgo = "À l'instant";
      } else if (minutes < 60) {
        timeAgo = `Il y a ${minutes} min`;
      } else if (hours < 24) {
        timeAgo = `Il y a ${hours}h`;
      } else {
        timeAgo = `Il y a ${days}j`;
      }

      const date = new Date(entry.date);
      const dateStr = date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      const clone = entryTemplate.content.cloneNode(true);
      const article = clone.querySelector('article');
      const competenceName = clone.querySelector('.historique-competence-name');
      competenceName.textContent = competenceInfo.name;
      competenceName.className = `historique-competence-name text-lg font-bold text-${competenceInfo.color}-400`;

      clone.querySelector('.historique-ac-code').textContent = `AC${acShortCode}`;
      clone.querySelector('.historique-level').textContent = `Niveau ${entry.newLevel}`;
      clone.querySelector('.historique-time-ago').textContent = timeAgo;
      clone.querySelector('.historique-date').textContent = dateStr;

      // Ajouter un ID pour le surlignage lors du trajet dans le temps
      article.dataset.historyIndex = index + 1;

      // Appliquer le style si on est déjà en mode voyage dans le temps
      if (index + 1 <= M.temporalStepsBack) {
        article.classList.add('opacity-40', 'grayscale-[0.5]');
        article.classList.remove('bg-ui-darker-lighter');
        article.classList.add('bg-ui-dark');
      }

      historiqueList.appendChild(clone);
    });

    V.setupHistorySlider(slider, modalContainer, history);
  }

  modalContainer.classList.remove('hidden');
  modalContainer.classList.add('flex');

  modalContainer.querySelector('.historique-close').onclick = () => {
    modalContainer.classList.add('hidden');
    modalContainer.classList.remove('flex');
  };

  modalContainer.onclick = (e) => {
    if (e.target === modalContainer) {
      modalContainer.classList.add('hidden');
      modalContainer.classList.remove('flex');
    }
  };
};

V.setupHistorySlider = function (slider, modalContainer, history) {
  const statusLabel = modalContainer.querySelector('#slider-status');
  const entries = modalContainer.querySelectorAll('[data-history-index]');

  slider.oninput = function () {
    const stepsBack = parseInt(this.value);

    // Calculer l'état de progression temporaire
    let tempProgress = JSON.parse(JSON.stringify(M.profile.progress));

    for (let i = 0; i < stepsBack; i++) {
      const entry = history[i];
      if (entry) {
        tempProgress[entry.code] = entry.oldLevel;
      }
    }

    // Mettre à jour l'étiquette de statut
    if (stepsBack === 0) {
      statusLabel.textContent = "État actuel";
      M.temporalProgress = null;
      M.temporalStepsBack = 0;
    } else {
      statusLabel.textContent = `Retour de ${stepsBack} étape(s)`;
      M.temporalProgress = tempProgress;
      M.temporalStepsBack = stepsBack;
    }

    // Surligner les entrées dans la liste qui sont "annulées" visuellement
    entries.forEach(entry => {
      const idx = parseInt(entry.dataset.historyIndex);
      if (idx <= stepsBack) {
        entry.classList.add('opacity-40', 'grayscale-[0.5]');
        entry.classList.remove('bg-ui-darker-lighter');
        entry.classList.add('bg-ui-dark');
      } else {
        entry.classList.remove('opacity-40', 'grayscale-[0.5]');
        entry.classList.add('bg-ui-darker-lighter');
        entry.classList.remove('bg-ui-dark');
      }
    });

    // Synchroniser la vue (cercles et barres) avec GSAP
    V.initializeACCircles(tempProgress);
    V.updateProgressionGlobale(tempProgress);
  };
};

V.showACModal = function (acCode) {
  const skillIndex = pn.getSkillIndex(acCode) - 1;
  const levelIndex = pn.getLevelIndex(acCode) - 1;
  const acIndex = pn.getACIndex(acCode) - 1;

  const competence = pn[skillIndex];
  const ac = competence.niveaux[levelIndex].acs[acIndex];
  const acNode = V.rootPage.querySelector(`[id="${acCode}"]`);

  const colorMap = {
    'c1': { name: 'comprendre', hex: 'var(--st-comprendre)' },
    'c2': { name: 'concevoir', hex: 'var(--st-concevoir)' },
    'c3': { name: 'exprimer', hex: 'var(--st-exprimer)' },
    'c4': { name: 'developper', hex: 'var(--st-developper)' },
    'c5': { name: 'entreprendre', hex: 'var(--st-entreprendre)' }
  };

  const color = colorMap[competence.couleur];

  let levelsHtml = '';
  for (let i = 0; i <= 5; i++) {
    levelsHtml += `<li class="level-btn flex items-center justify-center rounded-lg border border-slate-700/50 bg-slate-800/50 py-2 text-center text-xs font-medium text-white">${i}</li>`;
  }

  const html = acDetailsTemplate
    .replaceAll('{{code}}', ac.code)
    .replaceAll('{{short_code}}', ac.code.slice(0, 8))
    .replaceAll('{{libelle}}', ac.libelle)
    .replaceAll('{{description}}', ac.libelle)
    .replaceAll('{{colorname}}', color.name)
    .replaceAll('{{hex_color}}', color.hex)
    .replaceAll('{{levels_html}}', levelsHtml);

  const modalContainer = V.rootPage.querySelector('#ac-modal');
  modalContainer.querySelector('#ac-modal-content').innerHTML = html;
  modalContainer.classList.remove('hidden');
  modalContainer.classList.add('flex');

  modalContainer.querySelector('.modal-close').onclick = () => C.handleCloseModal(modalContainer);
  modalContainer.onclick = (e) => {
    if (e.target === modalContainer) C.handleCloseModal(modalContainer);
  };

  V.setupLevelButtons(modalContainer, color, acNode, ac.code);
};

export function SkilltreePage() {
  return C.init();
}