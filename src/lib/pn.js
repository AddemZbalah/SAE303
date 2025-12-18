import data from "@/data/skilltree.json";

let pn = [];

for (let cmp in data) {
  pn.push(data[cmp]);
}

pn.getLevelIndex = function (accode) {
  return accode.charAt(3);
}

pn.getSkillIndex = function (accode) {
  return accode.charAt(4);
}

pn.getACIndex = function (accode) {
  return accode.slice(6);
}

pn.getACLibelle = function (accode) {
  let skill = pn.getSkillIndex(accode) - 1;
  let level = pn.getLevelIndex(accode) - 1;
  let ac = pn.getACIndex(accode) - 1;

  return pn[skill].niveaux[level].acs[ac].libelle;
}

export { pn };