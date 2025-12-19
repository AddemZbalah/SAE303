import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";


class SkillsTreeView {
  constructor() {
    this.root = htmlToDOM(template);
  }

  html() {
    return template;
  }

  dom() {
    return this.root;
  }

  getSidebar() {
    return this.root.querySelector('#sidebar');
  }

  getToggleButton() {
    return this.root.querySelector('#sidebar-toggle');
  }

  getToggleIcon() {
    return this.root.querySelector('#toggle-icon');
  }

  getSidebarItems() {
    return this.root.querySelectorAll('.w-80 > div');
  }

  getCenterNode() {
    return this.root.querySelector('#MMI');
  }

  getUENodes() {
    const nodeIds = ['#COMPRENDRE', '#CONCEVOIR', '#EXPRIMER', '#DEVELOPPER', '#ENTREPRENDRE'];
    const nodes = [];
    for (let i = 0; i < nodeIds.length; i++) {
      const node = this.root.querySelector(nodeIds[i]);
      nodes.push(node);
    }
    return nodes;
  }

  getLines() {
    const lineIds = ['#Line_jaune_ue-concevoir', '#Line_violet_ue-entrprendre', '#Line_vert_ue-developper', '#Line_bleu_ue-comprendre', '#Line_rouge_ue-exprimer'];
    const lines = [];
    for (let i = 0; i < lineIds.length; i++) {
      const line = this.root.querySelector(lineIds[i]);
      lines.push(line);
    }
    return lines;
  }

  getLaserRects() {
    return {
      rect1: this.root.querySelector('.laser-rect'),
      rect2: this.root.querySelector('.laser-rect-2')
    };
  }

  getAllACNodes() {
    return this.root.querySelectorAll('g[id^="AC "]');
  }

  getSidebarListItems() {
    return this.root.querySelectorAll('[data-target]');
  }

  getNodeById(id) {
    return this.root.querySelector(`[id="${id}"]`);
  }

  getACModal() {
    return this.root.querySelector('#ac-modal');
  }

  getHistoriqueModal() {
    return this.root.querySelector('#historique-modal');
  }

  getHistoriqueButton() {
    return this.root.querySelector('#historique-btn');
  }

  getRadarToggleButton() {
    return this.root.querySelector('#radar-toggle-btn');
  }

  getExportButton() {
    return this.root.querySelector('#export-btn');
  }

  getImportButton() {
    return this.root.querySelector('#import-btn');
  }

  getImportInput() {
    return this.root.querySelector('#import-input');
  }

  getMenuBurgerButton() {
    return this.root.querySelector('#menu-burger-btn');
  }

  getMenuBurgerIcon() {
    return this.root.querySelector('#menu-burger-icon');
  }

  getMenuCloseIcon() {
    return this.root.querySelector('#menu-close-icon');
  }

  getMenuDropdown() {
    return this.root.querySelector('#menu-dropdown');
  }

  getLevelFilterButtons() {
    return this.root.querySelectorAll('.level-filter-btn');
  }

  getLevelFilterResetButton() {
    return this.root.querySelector('#level-filter-reset');
  }

  getMainArea() {
    return this.root.querySelector('#main-area');
  }

  getArbreSvg() {
    return this.root.querySelector('#arbre_de_competences_pour_svg');
  }

  getArbreUEPrincipale() {
    return this.root.querySelector('#ARBRE_UE_PRINCIPALE');
  }

  getTraitGroups() {
    return this.root.querySelectorAll('g[id^="traits_"]');
  }

  getProgressionItem(competence) {
    return this.root.querySelector(`li[data-competence="${competence}"]`);
  }

}

export { SkillsTreeView };