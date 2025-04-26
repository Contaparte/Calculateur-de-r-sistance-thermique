// Fonction pour convertir RSI en R
const rsiToR = (rsi) => {
  if (rsi === null || rsi === undefined || isNaN(rsi)) return null;
  return rsi * 5.678263;
};

// Déplacer une couche vers le haut
function moveLayerUp(index) {
  if (index <= 0 || index >= layers.length) return;
  
  // Échanger les couches
  [layers[index - 1], layers[index]] = [layers[index], layers[index - 1]];
  
  // Mettre à jour l'affichage
  updateLayersDisplay();
  updateMaterialsSummary();
}

// Déplacer une couche vers le bas
function moveLayerDown(index) {
  if (index < 0 || index >= layers.length - 1) return;
  
  // Échanger les couches
  [layers[index], layers[index + 1]] = [layers[index + 1], layers[index]];
  
  // Mettre à jour l'affichage
  updateLayersDisplay();
  updateMaterialsSummary();
}

// Supprimer une couche
function removeLayer(index) {
  if (index < 0 || index >= layers.length) return;
  
  // Supprimer la couche
  layers.splice(index, 1);
  
  // Mettre à jour l'affichage
  updateLayersDisplay();
  updateMaterialsSummary();
}

// Calculer les résultats
function calculateResults() {
  if (layers.length === 0) {
    alert("Veuillez ajouter au moins une couche de matériau pour l'analyse.");
    return;
  }
  
  // Afficher la section des résultats
  const noResultsMessage = document.getElementById('no-results-message');
  const resultsContent = document.getElementById('results-content');
  
  if (!noResultsMessage || !resultsContent) {
    console.error("Des éléments d'affichage des résultats n'ont pas été trouvés");
    return;
  }
  
  noResultsMessage.classList.add('hidden');
  resultsContent.classList.remove('hidden');
  
  // Calculer la résistance thermique totale
  const totalRSI = layers.reduce((sum, layer) => {
    if (layer.material && layer.material.rsi) {
      return sum + layer.material.rsi;
    }
    return sum;
  }, 0);
  
  // Calculer la résistance thermique effective (simplifiée)
  const effectiveRSI = totalRSI * 0.85;
  
  // Vérifier la conformité au code
  const totalCompliance = checkCompliance(totalRSI, envelopeComponent, climaticZone, false);
  const effectiveCompliance = checkCompliance(effectiveRSI, envelopeComponent, climaticZone, true);
  
  // Calculer les coefficients U
  const uValue = 1 / totalRSI;
  const uValueEffective = 1 / effectiveRSI;
  
  // Mettre à jour les résultats
  const resultTotalRsi = document.getElementById('result-total-rsi');
  const resultEffectiveRsi = document.getElementById('result-effective-rsi');
  const envelopeDescriptionElem = document.getElementById('envelope-description');
  const zoneDescriptionElem = document.getElementById('zone-description');
  const minTotalRsiElem = document.getElementById('min-total-rsi');
  const minEffectiveRsiElem = document.getElementById('min-effective-rsi');
  
  if (!resultTotalRsi || !resultEffectiveRsi || !envelopeDescriptionElem || !zoneDescriptionElem || !minTotalRsiElem || !minEffectiveRsiElem) {
    console.error("Des éléments d'affichage des résultats n'ont pas été trouvés");
    return;
  }
  
  resultTotalRsi.textContent = formatRSIR(totalRSI);
  resultEffectiveRsi.textContent = formatRSIR(effectiveRSI);
  
  envelopeDescriptionElem.textContent = getEnvelopeComponentDescription();
  zoneDescriptionElem.textContent = climaticZone === "< 6000" ? "moins de 6000 degrés-jours" : "6000 degrés-jours ou plus";
  
  minTotalRsi.textContent = formatRSIR(totalCompliance.minRSI);
  minEffectiveRsi.textContent = formatRSIR(effectiveCompliance.minRSI);
  
  // Mettre à jour le tableau de conformité
  const complianceTotalRsiValueElem = document.getElementById('compliance-total-rsi-value');
  const complianceTotalRsiMinElem = document.getElementById('compliance-total-rsi-min');
  const complianceTotalRsiStatusElem = document.getElementById('compliance-total-rsi-status');
  const complianceEffectiveRsiValueElem = document.getElementById('compliance-effective-rsi-value');
  const complianceEffectiveRsiMinElem = document.getElementById('compliance-effective-rsi-min');
  const complianceEffectiveRsiStatusElem = document.getElementById('compliance-effective-rsi-status');
  const complianceUValueElem = document.getElementById('compliance-u-value');
  const complianceUEffectiveElem = document.getElementById('compliance-u-effective');
  
  if (!complianceTotalRsiValueElem || !complianceTotalRsiMinElem || !complianceTotalRsiStatusElem || 
      !complianceEffectiveRsiValueElem || !complianceEffectiveRsiMinElem || !complianceEffectiveRsiStatusElem || 
      !complianceUValueElem || !complianceUEffectiveElem) {
    console.error("Des éléments d'affichage de la conformité n'ont pas été trouvés");
    return;
  }
  
  complianceTotalRsiValueElem.textContent = formatRSIR(totalRSI);
  complianceTotalRsiMinElem.textContent = formatRSIR(totalCompliance.minRSI);
  complianceTotalRsiStatusElem.innerHTML = getComplianceIndicator(totalCompliance.compliant);
  
  complianceEffectiveRsiValueElem.textContent = formatRSIR(effectiveRSI);
  complianceEffectiveRsiMinElem.textContent = formatRSIR(effectiveCompliance.minRSI);
  complianceEffectiveRsiStatusElem.innerHTML = getComplianceIndicator(effectiveCompliance.compliant);
  
  complianceUValueElem.textContent = `${uValue.toFixed(3)} W/(m²·K)`;
  complianceUEffectiveElem.textContent = `${uValueEffective.toFixed(3)} W/(m²·K)`;
  
  // Générer les recommandations
  generateThermalBridgesRecommendations(envelopeComponent);
  generateIsolationContinuityRecommendations();
  
  // Calculer et afficher le gradient de température et le point de rosée
  calculateGradient();
  
  // Ouvrir l'accordéon des résultats s'il est fermé
  const resultsSection = document.getElementById('results-section');
  
  if (resultsSection && resultsSection.classList.contains('hidden')) {
    toggleAccordion('results-section');
  }
}

// Calculer le gradient de température
function calculateGradient() {
  if (layers.length === 0) return;
  
  const tempExt = parseFloat(document.getElementById('temp-ext').value);
  const tempInt = parseFloat(document.getElementById('temp-int').value);
  const humidity = parseFloat(document.getElementById('humidity').value);
  
  // Calculer le point de rosée
  const dewPointTemp = calculateDewPoint(tempInt, humidity);
  
  const dewPointElem = document.getElementById('dew-point');
  const rsiTotalElem = document.getElementById('rsi-total');
  const rTotalElem = document.getElementById('r-total');
  const uValueElem = document.getElementById('u-value');
  
  if (!dewPointElem || !rsiTotalElem || !rTotalElem || !uValueElem) {
    console.error("Des éléments d'affichage du gradient n'ont pas été trouvés");
    return;
  }
  
  dewPointElem.textContent = dewPointTemp.toFixed(1);
  
  // Calculer la résistance thermique totale
  const rsiTotal = layers.reduce((sum, layer) => {
    if (layer.material && layer.material.rsi) {
      return sum + layer.material.rsi;
    }
    return sum;
  }, 0);
  
  rsiTotalElem.textContent = rsiTotal.toFixed(2);
  rTotalElem.textContent = (rsiTotal * 5.678).toFixed(1);
  uValueElem.textContent = (1/rsiTotal).toFixed(3);
  
  // Calculer le gradient de température
  const tempDiff = tempInt - tempExt;
  const positions = [0];
  const temps = [tempExt];
  let cumulPosition = 0;
  let cumulTemp = tempExt;
  
  // Calculer la température à chaque interface
  layers.forEach((layer) => {
    if (!layer.material || !layer.material.rsi) return;
    
    const deltaT = (layer.material.rsi / rsiTotal) * tempDiff;
    cumulTemp += deltaT;
    cumulPosition += (layer.material.thickness || 0);
    
    positions.push(cumulPosition);
    temps.push(cumulTemp);
  });
  
  // Mettre à jour le graphique
  updateChart(positions, temps, dewPointTemp, null);
  
  // Vérifier si le point de rosée tombe dans la composition
  const dewPointInfo = findDewPointPosition(temps, positions, dewPointTemp);
  
  // Mettre à jour la visualisation des matériaux
  renderMaterialsVisualization(dewPointInfo.position);
  
  // Afficher ou masquer l'avertissement
  const warningContainer = document.getElementById('warning-container');
  
  if (!warningContainer) {
    console.error("L'élément 'warning-container' n'a pas été trouvé");
    return;
  }
  
  warningContainer.innerHTML = '';
  
  if (dewPointInfo.found) {
    const dewPointMaterial = layers[dewPointInfo.materialIndex].material.name;
    
    warningContainer.innerHTML = `
      <div class="warning">
        <strong>Attention:</strong> Point de rosée (${dewPointTemp.toFixed(1)}°C) détecté dans 
        le matériau "${dewPointMaterial}". 
        Risque de condensation interne qui peut causer des problèmes d'humidité et de moisissure.
      </div>
    `;
    
    // Mettre à jour le graphique avec la position du point de rosée
    updateChart(positions, temps, dewPointTemp, dewPointInfo.position);
    
    // Mettre à jour le texte de résumé
    const summaryTextElem = document.getElementById('summary-text');
    
    if (summaryTextElem) {
      summaryTextElem.textContent = 
        `La température de part et d'autre de la paroi passe de ${tempExt}°C à ${tempInt}°C. ` +
        `Le point de rosée calculé est de ${dewPointTemp.toFixed(1)}°C à ${humidity}% d'humidité relative. ` +
        `Il y a risque de condensation dans le matériau "${dewPointMaterial}".`;
    }
  } else {
    const summaryTextElem = document.getElementById('summary-text');
    
    if (summaryTextElem) {
      summaryTextElem.textContent = 
        `La température de part et d'autre de la paroi passe de ${tempExt}°C à ${tempInt}°C. ` +
        `Le point de rosée calculé est de ${dewPointTemp.toFixed(1)}°C à ${humidity}% d'humidité relative. ` +
        `Aucun risque de condensation détecté dans cette composition.`;
    }
  }
}

// Rendre la visualisation des matériaux
function renderMaterialsVisualization(dewPointPosition = null) {
  const container = document.getElementById('material-viz');
  
  if (!container) {
    console.error("L'élément 'material-viz' n'a pas été trouvé");
    return;
  }
  
  container.innerHTML = '';
  
  if (layers.length === 0) return;
  
  const totalWidth = layers.reduce((sum, layer) => {
    return sum + (layer.material && layer.material.thickness ? layer.material.thickness : 0);
  }, 0);
  
  layers.forEach(layer => {
    if (!layer.material) return;
    
    const width = layer.material.thickness === 0 ? 20 : layer.material.thickness;
    const percentage = totalWidth > 0 ? (width / totalWidth) * 100 : 0;
    const backgroundColor = generateColorFromString(layer.material.name);
    
    const div = document.createElement('div');
    div.className = 'material-segment';
    div.style.width = `${percentage}%`;
    div.style.minWidth = '20px';
    div.style.backgroundColor = backgroundColor;
    div.title = `${layer.material.name} - RSI: ${layer.material.rsi.toFixed(2)}`;
    
    const span = document.createElement('span');
    span.textContent = layer.material.name;
    div.appendChild(span);
    
    container.appendChild(div);
  });
  
  // Ajouter le marqueur du point de rosée si présent
  if (dewPointPosition !== null) {
    const marker = document.createElement('div');
    marker.className = 'dewpoint-marker';
    marker.style.left = `${(dewPointPosition / totalWidth) * 100}%`;
    marker.title = 'Point de rosée';
    container.appendChild(marker);
  }
}

// Vérifier la conformité au code
function checkCompliance(rsi, component, zone, isEffective = false) {
  if (!zone || !component) return { compliant: false, minRSI: 0 };
  
  const minRSI = isEffective ? 
    minRSIEffectiveValues[zone][component] : 
    minRSITotalValues[zone][component];
  
  return {
    compliant: rsi >= minRSI,
    minRSI
  };
}

// Obtenir un indicateur visuel de conformité
function getComplianceIndicator(isCompliant) {
  return isCompliant ? 
    '<span class="text-green-600 font-bold">Conforme ✓</span>' : 
    '<span class="text-red-600 font-bold">Non conforme ✗</span>';
}

// Décrire le composant d'enveloppe sélectionné
function getEnvelopeComponentDescription() {
  switch (envelopeComponent) {
    case 'wall_above_grade':
      return 'un mur hors sol';
    case 'foundation_wall':
      return 'un mur de fondation';
    case 'roof':
      return 'un toit ou plafond';
    case 'floor':
      return 'un plancher séparant un espace chauffé d\'un espace non chauffé';
    case 'garage_ceiling':
      return 'un plafond de garage chauffé';
    case 'garage_walls_to_dwelling':
      return 'des murs de garage chauffé contigus au logement';
    case 'garage_foundation_wall':
      return 'un mur de fondation de garage chauffé';
    default:
      return 'cet élément';
  }
}

// Générer les recommandations pour les ponts thermiques
function generateThermalBridgesRecommendations(component) {
  const container = document.getElementById('thermal-bridges-recommendations');
  
  if (!container) {
    console.error("L'élément 'thermal-bridges-recommendations' n'a pas été trouvé");
    return;
  }
  
  container.innerHTML = '';
  
  let recommendations = [];
  
  if (component === 'wall_above_grade') {
    recommendations.push({
      title: "Exigences pour les ponts thermiques des murs",
      description: "Les éléments du bâtiment constituant un pont thermique doivent être recouverts de matériaux isolants ayant une résistance thermique minimale selon l'article 11.2.3.1. du Code:"
    });
    
    recommendations.push({
      title: "Pour une ossature de bois",
      description: "- RSI 0,7 lorsque les éléments d'ossature sont espacés de moins de 600 mm d'entraxe\n- RSI 0,53 dans les autres cas"
    });
    
    recommendations.push({
      title: "Pour une ossature métallique",
      description: "- RSI 1,76 lorsque les éléments d'ossature sont espacés de moins de 600 mm d'entraxe\n- RSI 1,32 dans les autres cas"
    });
    
    recommendations.push({
      title: "Pour une construction en béton",
      description: "- RSI 0,88 minimum"
    });
    
    recommendations.push({
      title: "Note importante",
      description: "Le matériau isolant doit couvrir les éléments du bâtiment constituant un pont thermique par l'extérieur, par l'intérieur ou par une combinaison des deux."
    });
  } 
  else if (component === 'foundation_wall') {
    recommendations.push({
      title: "Exigences pour les fondations",
      description: "Un mur de fondation dont plus de 50% de la surface est exposée à l'air extérieur, ainsi que la partie d'un mur de fondation qui est à ossature de bois, doivent avoir une résistance thermique totale égale à celle exigée pour un mur au-dessus du niveau du sol."
    });
    
    recommendations.push({
      title: "Bris thermique",
      description: "L'article 11.2.3.3 exige que le matériau isolant placé entre le mur de fondation et le plancher sur sol ait une résistance thermique d'au moins RSI 1,32 jusqu'à une profondeur de 600 mm sous le niveau du sol."
    });
  }
  else if (component === 'roof') {
    recommendations.push({
      title: "Résistance thermique à proximité des avant-toits",
      description: "Selon l'article 11.2.2.3, la résistance thermique totale exigée pour un toit ou plafond peut être réduite à proximité de l'avant-toit lorsque nécessaire pour la ventilation, à condition de ne pas être inférieure à la valeur exigée pour un mur au-dessus du niveau du sol."
    });
    
    recommendations.push({
      title: "Toits plats",
      description: "La résistance thermique totale pour les toits plats peut être réduite d'au plus 20% à son point le plus bas pour créer des pentes de drainage, à condition que la perte de chaleur totale ne soit pas supérieure à celle d'un toit conforme aux exigences."
    });
  }
  else if (component === 'floor') {
    recommendations.push({
      title: "Ponts thermiques des planchers",
      description: "Selon l'article 11.2.3.2, la résistance thermique des matériaux isolants recouvrant les ponts thermiques des planchers doit avoir une valeur d'au moins RSI 1,32 pour les planchers hors sol en porte-à-faux et les planchers situés au-dessus d'un espace non chauffé."
    });
  }
  
  recommendations.forEach((recommendation, index) => {
    const div = document.createElement('div');
    div.className = 'mb-3';
    
    const title = document.createElement('h4');
    title.className = 'font-bold text-blue-800';
    title.textContent = recommendation.title;
    
    const description = document.createElement('p');
    description.className = 'text-sm whitespace-pre-line';
    description.textContent = recommendation.description;
    
    div.appendChild(title);
    div.appendChild(description);
    
    container.appendChild(div);
  });
}

// Générer les recommandations pour la continuité de l'isolation
function generateIsolationContinuityRecommendations() {
  const container = document.getElementById('isolation-continuity-recommendations');
  
  if (!container) {
    console.error("L'élément 'isolation-continuity-recommendations' n'a pas été trouvé");
    return;
  }
  
  container.innerHTML = '';
  
  const recommendations = [
    {
      title: "Continuité de l'isolation",
      description: "Pour assurer la performance énergétique de l'enveloppe, l'isolation thermique doit être continue sur toute la surface de l'élément et les ponts thermiques doivent être minimisés selon les exigences du Code."
    },
    {
      title: "Solive de rive",
      description: "Selon l'article 11.2.3.1, la solive de rive doit être isolée de manière à posséder une valeur de résistance thermique totale équivalente à celle exigée pour un mur au-dessus du niveau du sol. Pour une construction de béton, une résistance thermique d'au moins RSI 1,76 est requise."
    },
    {
      title: "Murs entre espaces chauffés",
      description: "Lorsque le mur entre deux espaces chauffés crée un pont thermique, il doit être recouvert de matériaux isolants offrant une résistance thermique d'au moins RSI 2,20 de chaque côté du mur sur une distance minimale de 1,2 m à partir de la face extérieure du mur extérieur."
    }
  ];
  
  recommendations.forEach((recommendation, index) => {
    const div = document.createElement('div');
    div.className = 'mb-3';
    
    const title = document.createElement('h4');
    title.className = 'font-bold text-blue-800';
    title.textContent = recommendation.title;
    
    const description = document.createElement('p');
    description.className = 'text-sm';
    description.textContent = recommendation.description;
    
    div.appendChild(title);
    div.appendChild(description);
    
    container.appendChild(div);
  });
}

// Fonction pour ouvrir/fermer les accordéons
function toggleAccordion(sectionId) {
  const section = document.getElementById(sectionId);
  const icon = document.getElementById(`${sectionId}-icon`);
  
  if (!section || !icon) {
    console.error(`Des éléments de l'accordéon '${sectionId}' n'ont pas été trouvés`);
    return;
  }
  
  if (section.classList.contains('hidden')) {
    section.classList.remove('hidden');
    icon.innerHTML = '<polyline points="18 15 12 9 6 15"></polyline>';
  } else {
    section.classList.add('hidden');
    icon.innerHTML = '<polyline points="6 9 12 15 18 9"></polyline>';
  }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
  // Initialiser les sélecteurs
  initializeMunicipalitySelect();
  
  // Initialiser le graphique
  initializeChart();
  
  // Ajouter quelques couches par défaut pour démonstration
  addDefaultLayers();
  
  // Mettre à jour les affichages
  updateLayersDisplay();
  updateMaterialsSummary();
  
  // Événements du sélecteur d'épaisseur
  const thicknessSelect = document.getElementById('thickness-select');
  const customThicknessInput = document.getElementById('custom-thickness-input');
  
  if (thicknessSelect) {
    thicknessSelect.addEventListener('change', handleThicknessChange);
  }
  
  if (customThicknessInput) {
    customThicknessInput.addEventListener('change', handleCustomThicknessChange);
  }
});

// Ajouter des couches par défaut pour démonstration
function addDefaultLayers() {
  // Film d'air extérieur
  layers.push({
    id: Date.now(),
    type: 'airfilm',
    material: { ...materials.airFilms.find(m => m.id === 'exterior') }
  });
  
  // Brique
  layers.push({
    id: Date.now() + 1,
    type: 'cladding',
    material: { 
      ...materials.otherCladding.find(m => m.id === 'brick_90mm')
    }
  });
  
  // Isolant rigide
  const eps = { 
    ...materials.insulation.find(m => m.id === 'polystyrene_type2'),
    thickness: 50,
    rsi: 0.028 * 50
  };
  layers.push({
    id: Date.now() + 2,
    type: 'insulation',
    material: eps
  });
  
  // OSB
  const osb = { 
    ...materials.sheathing.find(m => m.id === 'osb'),
    thickness: 11,
    rsi: 0.0098 * 11
  };
  layers.push({
    id: Date.now() + 3,
    type: 'sheathening',
    material: osb
  });
  
  // Isolant en nattes
  layers.push({
    id: Date.now() + 4,
    type: 'insulation',
    material: { ...materials.insulation.find(m => m.id === 'mineral_wool_batt_r20') }
  });
  
  // Coupe-vapeur (négligeable thermiquement)
  
  // Gypse
  const gypsum = { 
    ...materials.interiorFinish.find(m => m.id === 'gypsum_interior'),
    thickness: 13,
    rsi: 0.0061 * 13
  };
  layers.push({
    id: Date.now() + 5,
    type: 'interior',
    material: gypsum
  });
  
  // Film d'air intérieur
  layers.push({
    id: Date.now() + 6,
    type: 'airfilm',
    material: { ...materials.airFilms.find(m => m.id === 'interior_vertical') }
  });
}

// Fonction pour convertir R en RSI
const rToRsi = (r) => {
  if (r === null || r === undefined || isNaN(r)) return null;
  return r / 5.678263;
};

// Fonction pour formater les valeurs RSI et R
const formatRSIR = (rsi) => {
  if (rsi === null || rsi === undefined || isNaN(rsi)) return "—";
  const r = rsiToR(rsi);
  return `RSI ${rsi.toFixed(2)} (R ${r.toFixed(2)})`;
};

// Valeurs minimales RSI selon le Code de construction du Québec (Partie 11)
// Pour la résistance thermique totale (RSI_T)
const minRSITotalValues = {
  "< 6000": {
    "roof": 7.22,              // Toit ou plafond
    "wall_above_grade": 4.31,  // Mur hors sol
    "foundation_wall": 2.99,   // Mur de fondation
    "floor": 5.20,             // Plancher séparant un espace chauffé d'un espace non chauffé
    "garage_ceiling": 5.20,    // Plafond de garage chauffé
    "garage_walls_to_dwelling": 3.50, // Murs de garage chauffé contigus au logement
    "garage_foundation_wall": 2.99 // Mur de fondation pour garage chauffé
  },
  ">= 6000": {
    "roof": 9.00,
    "wall_above_grade": 5.11,
    "foundation_wall": 2.99,
    "floor": 5.20,
    "garage_ceiling": 5.20,
    "garage_walls_to_dwelling": 3.50,
    "garage_foundation_wall": 2.99
  }
};

// Valeurs minimales RSI selon le Code de construction du Québec (Partie 11)
// Pour la résistance thermique effective (RSI_E)
const minRSIEffectiveValues = {
  "< 6000": {
    "roof": 5.46,              // Toit ou plafond
    "wall_above_grade": 3.60,  // Mur hors sol
    "foundation_wall": 2.64,   // Mur de fondation
    "floor": 5.46,             // Plancher exposé
    "garage_ceiling": 5.46,    // Plafond de garage chauffé (valeur estimée)
    "garage_walls_to_dwelling": 3.60, // Murs de garage (même valeur que mur hors sol)
    "garage_foundation_wall": 2.64 // Mur de fondation pour garage chauffé
  },
  ">= 6000": {
    "roof": 6.17,
    "wall_above_grade": 4.05,
    "foundation_wall": 2.64,
    "floor": 6.17,
    "garage_ceiling": 6.17,
    "garage_walls_to_dwelling": 4.05,
    "garage_foundation_wall": 2.64
  }
};

// Constantes pour les degrés-jours et les municipalités
const municipalities = [
  // Municipalités avec moins de 6000 degrés-jours
  { id: "acton-vale", name: "Acton-Vale", degreeDay: 4620, zone: "< 6000" },
  { id: "aylmer", name: "Aylmer", degreeDay: 4520, zone: "< 6000" },
  { id: "baie-saint-paul", name: "Baie-Saint-Paul", degreeDay: 5280, zone: "< 6000" },
  { id: "beauport", name: "Beauport", degreeDay: 5100, zone: "< 6000" },
  { id: "bedford", name: "Bedford", degreeDay: 4420, zone: "< 6000" },
  { id: "beloeil", name: "Beloeil", degreeDay: 4500, zone: "< 6000" },
  { id: "brome", name: "Brome", degreeDay: 4730, zone: "< 6000" },
  { id: "brossard", name: "Brossard", degreeDay: 4420, zone: "< 6000" },
  { id: "buckingham", name: "Buckingham", degreeDay: 4880, zone: "< 6000" },
  { id: "chambly", name: "Chambly", degreeDay: 4450, zone: "< 6000" },
  { id: "coaticook", name: "Coaticook", degreeDay: 4750, zone: "< 6000" },
  { id: "contrecoeur", name: "Contrecoeur", degreeDay: 4500, zone: "< 6000" },
  { id: "cowansville", name: "Cowansville", degreeDay: 4540, zone: "< 6000" },
  { id: "deux-montagnes", name: "Deux-Montagnes", degreeDay: 4440, zone: "< 6000" },
  { id: "drummondville", name: "Drummondville", degreeDay: 4700, zone: "< 6000" },
  { id: "farnham", name: "Farnham", degreeDay: 4500, zone: "< 6000" },
  { id: "fort-coulonge", name: "Fort-Coulonge", degreeDay: 4950, zone: "< 6000" },
  { id: "gaspe", name: "Gaspé", degreeDay: 5500, zone: "< 6000" },
  { id: "gatineau", name: "Gatineau", degreeDay: 4600, zone: "< 6000" },
  { id: "gracefield", name: "Gracefield", degreeDay: 5080, zone: "< 6000" },
  { id: "granby", name: "Granby", degreeDay: 4500, zone: "< 6000" },
  { id: "hemmingford", name: "Hemmingford", degreeDay: 4380, zone: "< 6000" },
  { id: "hull", name: "Hull", degreeDay: 4550, zone: "< 6000" },
  { id: "iberville", name: "Iberville", degreeDay: 4450, zone: "< 6000" },
  { id: "joliette", name: "Joliette", degreeDay: 4720, zone: "< 6000" },
  { id: "la-malbaie", name: "La Malbaie", degreeDay: 5400, zone: "< 6000" },
  { id: "la-pocatiere", name: "La Pocatière", degreeDay: 5160, zone: "< 6000" },
  { id: "la-tuque", name: "La Tuque", degreeDay: 5500, zone: "< 6000" },
  { id: "lac-megantic", name: "Lac-Mégantic", degreeDay: 5180, zone: "< 6000" },
  { id: "lachute", name: "Lachute", degreeDay: 4640, zone: "< 6000" },
  { id: "lennoxville", name: "Lennoxville", degreeDay: 4700, zone: "< 6000" },
  { id: "lery", name: "Léry", degreeDay: 4420, zone: "< 6000" },
  { id: "loretteville", name: "Loretteville", degreeDay: 5200, zone: "< 6000" },
  { id: "louiseville", name: "Louiseville", degreeDay: 4900, zone: "< 6000" },
  { id: "magog", name: "Magog", degreeDay: 4730, zone: "< 6000" },
  { id: "maniwaki", name: "Maniwaki", degreeDay: 5280, zone: "< 6000" },
  { id: "masson", name: "Masson", degreeDay: 4610, zone: "< 6000" },
  { id: "matane", name: "Matane", degreeDay: 5510, zone: "< 6000" },
  { id: "mont-joli", name: "Mont-Joli", degreeDay: 5370, zone: "< 6000" },
  { id: "mont-laurier", name: "Mont-Laurier", degreeDay: 5320, zone: "< 6000" },
  { id: "montmagny", name: "Montmagny", degreeDay: 5090, zone: "< 6000" },
  // Région de Montréal
  { id: "montreal", name: "Montréal (Hôtel de Ville)", degreeDay: 4200, zone: "< 6000" },
  { id: "beaconsfield", name: "Beaconsfield", degreeDay: 4440, zone: "< 6000" },
  { id: "dorval", name: "Dorval", degreeDay: 4400, zone: "< 6000" },
  { id: "laval", name: "Laval", degreeDay: 4500, zone: "< 6000" },
  { id: "montreal-est", name: "Montréal-Est", degreeDay: 4470, zone: "< 6000" },
  { id: "montreal-nord", name: "Montréal-Nord", degreeDay: 4470, zone: "< 6000" },
  { id: "outremont", name: "Outremont", degreeDay: 4300, zone: "< 6000" },
  { id: "pierrefonds", name: "Pierrefonds", degreeDay: 4430, zone: "< 6000" },
  { id: "st-lambert", name: "St-Lambert", degreeDay: 4400, zone: "< 6000" },
  { id: "st-laurent", name: "St-Laurent", degreeDay: 4270, zone: "< 6000" },
  { id: "ste-anne-de-bellevue", name: "Ste-Anne-de-Bellevue", degreeDay: 4460, zone: "< 6000" },
  { id: "verdun", name: "Verdun", degreeDay: 4200, zone: "< 6000" },
  // Autres municipalités (moins de 6000 DJ)
  { id: "nicolet", name: "Nicolet (Gentilly)", degreeDay: 4900, zone: "< 6000" },
  { id: "perce", name: "Percé", degreeDay: 5400, zone: "< 6000" },
  { id: "pincourt", name: "Pincourt", degreeDay: 4480, zone: "< 6000" },
  { id: "plessisville", name: "Plessisville", degreeDay: 5100, zone: "< 6000" },
  // Région de Québec
  { id: "quebec", name: "Québec", degreeDay: 5080, zone: "< 6000" },
  { id: "ancienne-lorette", name: "Ancienne-Lorette", degreeDay: 5130, zone: "< 6000" },
  { id: "levis", name: "Lévis", degreeDay: 5050, zone: "< 6000" },
  { id: "sillery", name: "Sillery", degreeDay: 5070, zone: "< 6000" },
  { id: "ste-foy", name: "Ste-Foy", degreeDay: 5100, zone: "< 6000" },
  // Autres municipalités (moins de 6000 DJ)
  { id: "richmond", name: "Richmond", degreeDay: 4700, zone: "< 6000" },
  { id: "rimouski", name: "Rimouski", degreeDay: 5300, zone: "< 6000" },
  { id: "riviere-du-loup", name: "Rivière-du-Loup", degreeDay: 5380, zone: "< 6000" },
  { id: "rock-island", name: "Rock-Island", degreeDay: 4850, zone: "< 6000" },
  { id: "rosemere", name: "Rosemère", degreeDay: 4550, zone: "< 6000" },
  { id: "saguenay", name: "Saguenay", degreeDay: 5700, zone: "< 6000" },
  { id: "saguenay-bagotville", name: "Saguenay (Bagotville)", degreeDay: 5700, zone: "< 6000" },
  { id: "saguenay-jonquiere", name: "Saguenay (Jonquière)", degreeDay: 5650, zone: "< 6000" },
  { id: "saguenay-kenogami", name: "Saguenay (Kenogami)", degreeDay: 5650, zone: "< 6000" },
  { id: "saint-eustache", name: "Saint-Eustache", degreeDay: 4500, zone: "< 6000" },
  { id: "saint-jean-sur-richelieu", name: "Saint-Jean-sur-Richelieu", degreeDay: 4450, zone: "< 6000" },
  { id: "salaberry-de-valleyfield", name: "Salaberry-de-Valleyfield", degreeDay: 4400, zone: "< 6000" },
  { id: "shawinigan", name: "Shawinigan", degreeDay: 5050, zone: "< 6000" },
  { id: "shawville", name: "Shawville", degreeDay: 4880, zone: "< 6000" },
  { id: "sherbrooke", name: "Sherbrooke", degreeDay: 4700, zone: "< 6000" },
  { id: "sorel", name: "Sorel", degreeDay: 4550, zone: "< 6000" },
  { id: "st-georges-de-cacouna", name: "St-Georges-de-Cacouna", degreeDay: 5400, zone: "< 6000" },
  { id: "st-hubert", name: "St-Hubert", degreeDay: 4490, zone: "< 6000" },
  { id: "st-hyacinthe", name: "St-Hyacinthe", degreeDay: 4500, zone: "< 6000" },
  { id: "st-jerome", name: "St-Jérôme", degreeDay: 4820, zone: "< 6000" },
  { id: "st-jovite", name: "St-Jovite", degreeDay: 5250, zone: "< 6000" },
  { id: "st-lazare-hudson", name: "St-Lazare-Hudson", degreeDay: 4520, zone: "< 6000" },
  { id: "st-nicolas", name: "St-Nicolas", degreeDay: 4990, zone: "< 6000" },
  { id: "ste-agathe-des-monts", name: "Ste-Agathe-des-Monts", degreeDay: 5390, zone: "< 6000" },
  { id: "sutton", name: "Sutton", degreeDay: 4600, zone: "< 6000" },
  { id: "tadoussac", name: "Tadoussac", degreeDay: 5450, zone: "< 6000" },
  { id: "temiscaming", name: "Témiscaming", degreeDay: 5020, zone: "< 6000" },
  { id: "terrebonne", name: "Terrebonne", degreeDay: 4500, zone: "< 6000" },
  { id: "thetford-mines", name: "Thetford Mines", degreeDay: 5120, zone: "< 6000" },
  { id: "thurso", name: "Thurso", degreeDay: 4820, zone: "< 6000" },
  { id: "trois-rivieres", name: "Trois-Rivières", degreeDay: 4900, zone: "< 6000" },
  { id: "varennes", name: "Varennes", degreeDay: 4500, zone: "< 6000" },
  { id: "vercheres", name: "Verchères", degreeDay: 4450, zone: "< 6000" },
  { id: "victoriaville", name: "Victoriaville", degreeDay: 4900, zone: "< 6000" },
  { id: "wakefield", name: "Wakefield", degreeDay: 4820, zone: "< 6000" },
  { id: "waterloo", name: "Waterloo", degreeDay: 4650, zone: "< 6000" },
  { id: "windsor", name: "Windsor", degreeDay: 4700, zone: "< 6000" },
  
  // Municipalités avec 6000 degrés-jours ou plus
  { id: "alma", name: "Alma", degreeDay: 5800, zone: ">= 6000" },
  { id: "amos", name: "Amos", degreeDay: 6160, zone: ">= 6000" },
  { id: "baie-comeau", name: "Baie-Comeau", degreeDay: 6020, zone: ">= 6000" },
  { id: "dolbeau", name: "Dolbeau", degreeDay: 6250, zone: ">= 6000" },
  { id: "gagnon", name: "Gagnon", degreeDay: 7600, zone: ">= 6000" },
  { id: "harrington-harbour", name: "Harrington-Harbour", degreeDay: 6150, zone: ">= 6000" },
  { id: "havre-st-pierre", name: "Havre-St-Pierre", degreeDay: 6100, zone: ">= 6000" },
  { id: "inukjuak", name: "Inukjuak", degreeDay: 9150, zone: ">= 6000" },
  { id: "kuujjuaq", name: "Kuujjuaq", degreeDay: 8550, zone: ">= 6000" },
  { id: "kuujjuarapik", name: "Kuujjuarapik", degreeDay: 7990, zone: ">= 6000" },
  { id: "malartic", name: "Malartic", degreeDay: 6200, zone: ">= 6000" },
  { id: "nitchequon", name: "Nitchequon", degreeDay: 8100, zone: ">= 6000" },
  { id: "noranda", name: "Noranda", degreeDay: 6050, zone: ">= 6000" },
  { id: "port-cartier", name: "Port-Cartier", degreeDay: 6060, zone: ">= 6000" },
  { id: "puvirnituq", name: "Puvirnituq", degreeDay: 9200, zone: ">= 6000" },
  { id: "roberval", name: "Roberval", degreeDay: 5750, zone: ">= 6000" },
  { id: "rouyn", name: "Rouyn", degreeDay: 6050, zone: ">= 6000" },
  { id: "schefferville", name: "Schefferville", degreeDay: 8550, zone: ">= 6000" },
  { id: "senneterre", name: "Senneterre", degreeDay: 6180, zone: ">= 6000" },
  { id: "sept-iles", name: "Sept-Îles", degreeDay: 6200, zone: ">= 6000" },
  { id: "st-felicien", name: "St-Félicien", degreeDay: 5850, zone: ">= 6000" },
  { id: "st-hubert-de-riviere-du-loup", name: "St-Hubert-de-Rivière-du-Loup", degreeDay: 5520, zone: ">= 6000" },
  { id: "val-dor", name: "Val-d'Or", degreeDay: 6180, zone: ">= 6000" },
  { id: "ville-marie", name: "Ville-Marie", degreeDay: 5550, zone: ">= 6000" }
];

// Table de pression de saturation de vapeur d'eau
const saturationTable = [
    { temp: -60, pressure: 0.001 },
    { temp: -40, pressure: 0.13 },
    { temp: -20, pressure: 1.03 },
    { temp: -18, pressure: 1.5 },
    { temp: -15, pressure: 1.9 },
    { temp: -12, pressure: 2.4 },
    { temp: -10, pressure: 2.6 },
    { temp: -9, pressure: 3.0 },
    { temp: -7, pressure: 3.7 },
    { temp: -4, pressure: 4.6 },
    { temp: -1, pressure: 5.6 },
    { temp: 0, pressure: 6.11 },
    { temp: 2, pressure: 7.06 },
    { temp: 4, pressure: 8.13 },
    { temp: 6, pressure: 9.35 },
    { temp: 8, pressure: 10.73 },
    { temp: 10, pressure: 12.28 },
    { temp: 11, pressure: 13.12 },
    { temp: 12, pressure: 14.02 },
    { temp: 13, pressure: 14.97 },
    { temp: 14, pressure: 15.98 },
    { temp: 15, pressure: 17.05 },
    { temp: 16, pressure: 18.18 },
    { temp: 17, pressure: 19.37 },
    { temp: 18, pressure: 20.63 },
    { temp: 19, pressure: 21.97 },
    { temp: 20, pressure: 23.38 },
    { temp: 21, pressure: 24.87 },
    { temp: 22, pressure: 26.43 },
    { temp: 23, pressure: 28.09 },
    { temp: 24, pressure: 29.83 },
    { temp: 25, pressure: 31.67 },
    { temp: 26, pressure: 33.6 },
    { temp: 27, pressure: 35.64 },
    { temp: 28, pressure: 37.8 },
    { temp: 29, pressure: 40.05 },
    { temp: 30, pressure: 42.43 },
    { temp: 31, pressure: 44.92 },
    { temp: 32, pressure: 47.55 },
    { temp: 33, pressure: 50.3 },
    { temp: 34, pressure: 53.19 },
    { temp: 35, pressure: 56.23 },
    { temp: 36, pressure: 59.41 },
    { temp: 37, pressure: 62.75 },
    { temp: 38, pressure: 66.25 },
    { temp: 39, pressure: 69.92 },
    { temp: 40, pressure: 73.75 },
    { temp: 45, pressure: 95.83 },
    { temp: 50, pressure: 123.34 },
    { temp: 55, pressure: 157.37 },
    { temp: 60, pressure: 199.16 },
    { temp: 65, pressure: 250.03 }
];

// Base de données des matériaux avec leurs valeurs RSI
const materials = {
  // Films d'air
  airFilms: [
    { id: "exterior", name: "Film d'air extérieur", rsi: 0.03, description: "Pellicule d'air de surface (vent hivernal de 24 Km/h)" },
    { id: "interior_vertical", name: "Film d'air intérieur (mur)", rsi: 0.12, description: "Air stable, surface verticale, flux thermique horizontal" },
    { id: "interior_ceiling", name: "Film d'air intérieur (plafond)", rsi: 0.11, description: "Air stable, surface horizontale, flux thermique ascendant" },
    { id: "interior_floor", name: "Film d'air intérieur (plancher)", rsi: 0.16, description: "Air stable, surface horizontale, flux thermique descendant" }
  ],
  
  // Lames d'air non réfléchissantes
  airSpaces: [
    // Murs (flux thermique horizontal)
    { id: "airspace_wall_13mm", name: "Lame d'air dans un mur - 13mm", rsi: 0.16, description: "min. 13mm (1/2'')", thickness: 13 },
    { id: "airspace_wall_20mm", name: "Lame d'air dans un mur - 20mm+", rsi: 0.18, description: "20mm (3/4'') et +", thickness: 20 },
    { id: "airspace_wall_40mm", name: "Lame d'air dans un mur - 40mm+", rsi: 0.18, description: "40mm (1 1/2'') et +", thickness: 40 },
    { id: "airspace_wall_90mm", name: "Lame d'air dans un mur - 90mm+", rsi: 0.18, description: "90mm (3 1/2'') et +", thickness: 90 },
    
    // Plafonds (flux thermique ascendant)
    { id: "airspace_ceiling_13mm", name: "Lame d'air dans un plafond - 13mm", rsi: 0.15, description: "min. 13mm (1/2'')", thickness: 13 },
    { id: "airspace_ceiling_20mm", name: "Lame d'air dans un plafond - 20mm+", rsi: 0.15, description: "20mm (3/4'') et +", thickness: 20 },
    { id: "airspace_ceiling_40mm", name: "Lame d'air dans un plafond - 40mm+", rsi: 0.16, description: "40mm (1 1/2'') et +", thickness: 40 },
    { id: "airspace_ceiling_90mm", name: "Lame d'air dans un plafond - 90mm+", rsi: 0.16, description: "90mm (3 1/2'') et +", thickness: 90 },
    
    // Planchers (flux thermique descendant)
    { id: "airspace_floor_13mm", name: "Lame d'air dans un plancher - 13mm", rsi: 0.16, description: "min. 13mm (1/2'')", thickness: 13 },
    { id: "airspace_floor_20mm", name: "Lame d'air dans un plancher - 20mm+", rsi: 0.18, description: "20mm (3/4'') et +", thickness: 20 },
    { id: "airspace_floor_40mm", name: "Lame d'air dans un plancher - 40mm+", rsi: 0.2, description: "40mm (1 1/2'') et +", thickness: 40 },
    { id: "airspace_floor_90mm", name: "Lame d'air dans un plancher - 90mm+", rsi: 0.22, description: "90mm (3 1/2'') et +", thickness: 90 }
  ],
  
  // Lames d'air réfléchissantes
  reflectiveAirSpaces: [
    // Murs (flux thermique horizontal)
    { id: "reflective_wall_oneside", name: "Lame d'air réfléchissante dans un mur - parée d'un côté", rsi: 0.465, description: "Lame verticale parée d'un côté, flux thermique horizontal entre 13 et 19mm", thickness: 19 },
    { id: "reflective_wall_bothsides", name: "Lame d'air réfléchissante dans un mur - parée de deux côtés", rsi: 0.48, description: "Lame verticale parée de deux côtés, flux thermique horizontal entre 13 et 19mm", thickness: 19 },
    
    // Plafonds (flux thermique ascendant)
    { id: "reflective_ceiling_oneside", name: "Lame d'air réfléchissante dans un plafond - parée d'un côté", rsi: 0.324, description: "Lame horizontale parée d'un côté, flux thermique ascendant entre 13 et 19mm", thickness: 19 },
    { id: "reflective_ceiling_bothsides", name: "Lame d'air réfléchissante dans un plafond - parée de deux côtés", rsi: 0.332, description: "Lame horizontale parée de deux côtés, flux thermique ascendant entre 13 et 19mm", thickness: 19 },
    
    // Planchers (flux thermique descendant)
    { id: "reflective_floor_oneside", name: "Lame d'air réfléchissante dans un plancher - parée d'un côté", rsi: 0.98, description: "Lame horizontale parée d'un côté, flux thermique descendant entre 13 et 19mm", thickness: 19 },
    { id: "reflective_floor_bothsides", name: "Lame d'air réfléchissante dans un plancher - parée de deux côtés", rsi: 1.034, description: "Lame horizontale parée de deux côtés, flux thermique descendant entre 13 et 19mm", thickness: 19 }
  ],

  // Matériaux de charpente - Bois
  wood: [
    { id: "wood_spf", name: "Bois de construction courant (S-P-F)", rsiPerMm: 0.0085, description: "Bois de construction courant (Épinette-Pin-Sapin)" },
    { id: "wood_birch", name: "Bouleau", rsiPerMm: 0.0055, description: "Bouleau" },
    { id: "wood_oak", name: "Chêne", rsiPerMm: 0.0056, description: "Chêne" },
    { id: "wood_maple", name: "Érable", rsiPerMm: 0.0063, description: "Érable et frêne" },
    { id: "wood_cedar", name: "Cèdre blanc", rsiPerMm: 0.0099, description: "Cèdre blanc" },
    { id: "wood_cypress", name: "Cyprès jaune", rsiPerMm: 0.0077, description: "Cyprès jaune" },
    { id: "wood_spruce", name: "Épinette blanche", rsiPerMm: 0.0097, description: "Épinette blanche" },
    { id: "wood_pine_white", name: "Pin blanc", rsiPerMm: 0.0092, description: "Pin blanc" },
    { id: "wood_pine_lodgepole", name: "Pin lodgepole", rsiPerMm: 0.0082, description: "Pin lodgepole" },
    { id: "wood_pine_red", name: "Pin rouge", rsiPerMm: 0.0077, description: "Pin rouge" },
    { id: "wood_hemlock", name: "Pruche", rsiPerMm: 0.0084, description: "Pruche" },
    { id: "wood_hemlock_western", name: "Pruche de l'ouest", rsiPerMm: 0.0074, description: "Pruche de l'ouest" },
    { id: "wood_doug_fir", name: "Sapin de Douglas ou mélèze", rsiPerMm: 0.0069, description: "Sapin de Douglas ou mélèze" },
    { id: "wood_fir", name: "Sapin gracieux", rsiPerMm: 0.008, description: "Sapin gracieux" },
    { id: "wood_sequoia", name: "Séquoia de Californie", rsiPerMm: 0.0089, description: "Séquoia de Californie" },
    { id: "wood_cedarwood", name: "Thuya géant", rsiPerMm: 0.0102, description: "Thuya géant" }
  ],
  
  // Béton
  concrete: [
    { id: "concrete_2400", name: "Béton 2400 kg/m³", rsiPerMm: 0.0004, description: "Béton coulé sur place, 2400 kg/m³ (150lbs/pi³)" },
    { id: "concrete_1600", name: "Béton léger 1600 kg/m³", rsiPerMm: 0.0013, description: "Béton léger, 1600 kg/m³ (100lbs/pi³) (schiste, argile ou ardoise expansés, laitier expansé, cendre)" },
    { id: "concrete_480", name: "Béton léger 480 kg/m³", rsiPerMm: 0.0069, description: "Béton léger, 480 kg/m³ (30lbs/pi³) (perlite, vermiculite et billes de polystyrène)" }
  ],
  
  // Blocs de béton
  concreteBlocks: [
    // Blocs de béton à 2 cellules rectangulaires - agrégats de densité normale
    { id: "block_90mm", name: "Bloc de béton - 90mm", rsi: 0.17, description: "Blocs de béton à 2 cellules, béton lourds (2100kg/m³) - 90mm", thickness: 90 },
    { id: "block_140mm", name: "Bloc de béton - 140mm", rsi: 0.19, description: "Blocs de béton à 2 cellules, béton lourds (2100kg/m³) - 140mm", thickness: 140 },
    { id: "block_190mm", name: "Bloc de béton - 190mm", rsi: 0.21, description: "Blocs de béton à 2 cellules, béton lourds (2100kg/m³) - 190mm", thickness: 190 },
    { id: "block_240mm", name: "Bloc de béton - 240mm", rsi: 0.24, description: "Blocs de béton à 2 cellules, béton lourds (2100kg/m³) - 240mm", thickness: 240 },
    { id: "block_290mm", name: "Bloc de béton - 290mm", rsi: 0.26, description: "Blocs de béton à 2 cellules, béton lourds (2100kg/m³) - 290mm", thickness: 290 },
    { id: "block_vermiculite_140mm", name: "Bloc de béton avec vermiculite - 140mm", rsi: 0.4, description: "Blocs de béton à 2 cellules, béton lourds (2100kg/m³) remplis de vermiculite - 140mm", thickness: 140 },
    { id: "block_vermiculite_190mm", name: "Bloc de béton avec vermiculite - 190mm", rsi: 0.51, description: "Blocs de béton à 2 cellules, béton lourds (2100kg/m³) remplis de vermiculite - 190mm", thickness: 190 },
    { id: "block_vermiculite_240mm", name: "Bloc de béton avec vermiculite - 240mm", rsi: 0.61, description: "Blocs de béton à 2 cellules, béton lourds (2100kg/m³) remplis de vermiculite - 240mm", thickness: 240 },
    { id: "block_vermiculite_290mm", name: "Bloc de béton avec vermiculite - 290mm", rsi: 0.69, description: "Blocs de béton à 2 cellules, béton lourds (2100kg/m³) remplis de vermiculite - 290mm", thickness: 290 },
    { id: "block_perlite_190mm", name: "Bloc de béton avec perlite - 190mm", rsi: 0.53, description: "Blocs de béton à 2 cellules, béton lourds (2100kg/m³) remplis de perlite - 190mm", thickness: 190 },
    
    // Blocs de béton - agrégats de faible densité
    { id: "block_light_90mm", name: "Bloc de béton léger - 90mm", rsi: 0.24, description: "Blocs de béton à 2/3 cellules, agrégats de faible densité - 90mm", thickness: 90 },
    { id: "block_light_140mm", name: "Bloc de béton léger - 140mm", rsi: 0.30, description: "Blocs de béton à 2/3 cellules, agrégats de faible densité - 140mm", thickness: 140 },
    { id: "block_light_190mm", name: "Bloc de béton léger - 190mm", rsi: 0.32, description: "Blocs de béton à 2/3 cellules, agrégats de faible densité - 190mm", thickness: 190 },
    { id: "block_light_240mm", name: "Bloc de béton léger - 240mm", rsi: 0.33, description: "Blocs de béton à 2/3 cellules, agrégats de faible densité - 240mm", thickness: 240 },
    { id: "block_light_290mm", name: "Bloc de béton léger - 290mm", rsi: 0.41, description: "Blocs de béton à 2/3 cellules, agrégats de faible densité - 290mm", thickness: 290 }
  ],

  // Isolants
  insulation: [
    // Isolants en nattes
    { id: "mineral_wool_batt_r12", name: "Laine minérale en nattes R-12", rsi: 2.11, description: "Nattes de fibre minérale de roche ou de verre R-12 (89/92mm)", thickness: 89 },
    { id: "mineral_wool_batt_r14", name: "Laine minérale en nattes R-14", rsi: 2.46, description: "Nattes de fibre minérale de roche ou de verre R-14 (89/92mm)", thickness: 89 },
    { id: "mineral_wool_batt_r19", name: "Laine minérale en nattes R-19", rsi: 3.34, description: "Nattes de fibre minérale de roche ou de verre R-19 (140mm)", thickness: 140 },
    { id: "mineral_wool_batt_r20", name: "Laine minérale en nattes R-20", rsi: 3.52, description: "Nattes de fibre minérale de roche ou de verre R-20 (152mm)", thickness: 152 },
    { id: "mineral_wool_batt_r22", name: "Laine minérale en nattes R-22", rsi: 3.87, description: "Nattes de fibre minérale de roche ou de verre R-22 (140/152mm)", thickness: 152 },
    { id: "mineral_wool_batt_r22_5", name: "Laine minérale en nattes R-22.5", rsi: 3.96, description: "Nattes de fibre minérale de roche ou de verre R-22.5 (152mm)", thickness: 152 },
    { id: "mineral_wool_batt_r24", name: "Laine minérale en nattes R-24", rsi: 4.23, description: "Nattes de fibre minérale de roche ou de verre R-24 (140/152mm)", thickness: 152 },
    { id: "mineral_wool_batt_r28", name: "Laine minérale en nattes R-28", rsi: 4.93, description: "Nattes de fibre minérale de roche ou de verre R-28 (178/216mm)", thickness: 216 },
    { id: "mineral_wool_batt_r31", name: "Laine minérale en nattes R-31", rsi: 5.46, description: "Nattes de fibre minérale de roche ou de verre R-31 (241mm)", thickness: 241 },
    { id: "mineral_wool_batt_r35", name: "Laine minérale en nattes R-35", rsi: 6.16, description: "Nattes de fibre minérale de roche ou de verre R-35 (267mm)", thickness: 267 },
    { id: "mineral_wool_batt_r40", name: "Laine minérale en nattes R-40", rsi: 7.04, description: "Nattes de fibre minérale de roche ou de verre R-40 (279/300mm)", thickness: 300 },
    
    // Panneaux isolants
    { id: "insulation_panel_roof", name: "Panneau isolant pour toiture", rsiPerMm: 0.018, description: "Panneau isolant pour toiture" },
    { id: "insulation_panel_wall", name: "Panneau isolant pour murs ou plafonds", rsiPerMm: 0.016, description: "Panneau isolant pour murs ou plafonds (carreaux)" },
    { id: "fiberglass_thermal", name: "Laine de fibre de verre, usage thermique", rsiPerMm: 0.0208, description: "Laine de fibre de verre, usage thermique (Eco Touch thermique de Owens Corning)" },
    { id: "mineral_wool", name: "Laine de roche", rsiPerMm: 0.0276, description: "Laine de roche (Roxul Cavity Rock)" },
    
    // Polystyrène
    { id: "polystyrene_type1", name: "Polystyrène expansé Type 1", rsiPerMm: 0.026, description: "Polystyrène expansé Type 1" },
    { id: "polystyrene_type2", name: "Polystyrène expansé Type 2", rsiPerMm: 0.028, description: "Polystyrène expansé Type 2" },
    { id: "polystyrene_type3", name: "Polystyrène expansé Type 3", rsiPerMm: 0.030, description: "Polystyrène expansé Type 3" },
    { id: "polystyrene_type4", name: "Polystyrène expansé Type 4", rsiPerMm: 0.0347, description: "Polystyrène expansé Type 4" },
    { id: "extruded_polystyrene", name: "Polystyrène extrudé", rsiPerMm: 0.035, description: "Polystyrène extrudé: Types 2, 3 et 4" },
    
    // Polyisocyanurate
    { id: "polyiso_permeable", name: "Polyisocyanurate revêtu perméable", rsiPerMm: 0.03818, description: "Polyisocyanurate ou polyuréthane, revêtus, types 1, 2 et 3, surface perméable" },
    { id: "polyiso_impermeable", name: "Polyisocyanurate revêtu imperméable", rsiPerMm: 0.03937, description: "Polyisocyanurate ou polyuréthane, revêtus, types 1, 2 et 3, surface imperméable" },
    { id: "polyiso", name: "Panneau rigide de polyisocyanurate", rsiPerMm: 0.042, description: "Panneau rigide de polyisocyanurate (Sopra-Iso de Soprema)" },
    
    // Isolants en vrac
    { id: "cellulose_blown", name: "Fibre cellulosique épandue (combles)", rsiPerMm: 0.025, description: "Cellulose en vrac pour combles" },
    { id: "mineral_blown_attic", name: "Fibre minérale épandue (combles)", rsiPerMm: 0.01875, description: "Fibre minérale en vrac pour combles (112mm à 565mm)" },
    { id: "mineral_injected_89mm", name: "Fibre minérale injectée (murs), 89mm", rsi: 2.55, description: "Fibre minérale injectée (murs), 89mm", rsiPerMm: 0.02865, thickness: 89 },
    { id: "mineral_injected_140mm", name: "Fibre minérale injectée (murs), 140mm", rsi: 4.05, description: "Fibre minérale injectée (murs), 140mm", rsiPerMm: 0.0289, thickness: 140 },
    { id: "mineral_injected_152mm", name: "Fibre minérale injectée (murs), 152mm", rsi: 4.23, description: "Fibre minérale injectée (murs), 152mm (6'')", thickness: 152 }
  ],
  
  // Revêtements d'ossature
  sheathing: [
    { id: "plywood", name: "Contreplaqué de bois tendre", rsiPerMm: 0.0087, description: "Contreplaqué de bois tendre" },
    { id: "plywood_douglas_fir", name: "Contreplaqué de sapin de Douglas", rsiPerMm: 0.0111, description: "Contreplaqué de sapin de Douglas" },
    { id: "particleboard", name: "Panneau de particules", rsiPerMm: 0.0077, description: "Panneau de particules" },
    { id: "osb", name: "Panneaux de copeaux (OSB)", rsiPerMm: 0.0098, description: "Panneaux de copeaux orientés (OSB)" },
    { id: "fiberboard_asphalt", name: "Revêtement en carton-fibre asphalté", rsiPerMm: 0.0165, description: "Revêtement en carton-fibre asphalté" },
    { id: "gypsum", name: "Revêtement en plaque de plâtre (gypse)", rsiPerMm: 0.0063, description: "Revêtement en plaque de plâtre (panneaux de gypse)" },
    { id: "reflective_fiberboard", name: "Panneau de fibre de bois avec pellicule réfléchissante", rsiPerMm: 0.0194, description: "Panneau de fibre de bois avec pellicule réfléchissante" }
  ],

  // Parements de bois
  woodCladding: [
    { id: "wood_shingle_190mm", name: "Bardeau de bois 400mm, pureau de 190mm", rsi: 0.15, description: "Bardeau de bois 400mm, pureau de 190mm", thickness: 10 },
    { id: "wood_shingle_300mm", name: "Bardeau de bois 400mm, pureau double de 300mm", rsi: 0.21, description: "Bardeau de bois 400mm, pureau double de 300mm", thickness: 15 },
    { id: "wood_siding_200mm_13mm", name: "Bardage de bois à clin 200mm, joints à recouvrement, épaisseur 13mm", rsi: 0.14, description: "Bardage de bois à clin 200mm, joints à recouvrement, épaisseur 13mm", thickness: 13 },
    { id: "wood_siding_250mm_20mm", name: "Bardage de bois à clin 250mm, joints à recouvrement, épaisseur 20mm", rsi: 0.18, description: "Bardage de bois à clin 250mm, joints à recouvrement, épaisseur 20mm", thickness: 20 },
    { id: "wood_siding_200mm_20mm", name: "Bardage à mi-bois, 200mm, épaisseur 20mm", rsi: 0.14, description: "Bardage à mi-bois, 200mm, épaisseur 20mm", thickness: 20 },
    { id: "hardboard_11mm", name: "Panneaux de fibres dures, épaisseur 11mm", rsi: 0.12, description: "Panneaux de fibres dures, épaisseur 11mm (ex.: Canexel)", thickness: 11 },
    { id: "plywood_siding", name: "Contreplaqué, joints à recouvrement", rsi: 0.10, description: "Contreplaqué, joints à recouvrement, 9,5mm", thickness: 9.5 }
  ],

  // Autres parements
  otherCladding: [
    { id: "brick_90mm", name: "Brique d'argile ou schiste - 90mm", rsi: 0.07, description: "Brique d'argile ou schiste - 90mm (4''nominal, 2400 kg/m³)", thickness: 90 },
    { id: "brick_concrete_90mm", name: "Brique de béton ou silico-calcaire - 90mm", rsi: 0.053, description: "Brique de béton ou silico-calcaire - 90mm (4'' nominal)", thickness: 90 },
    { id: "fibercement_6.35mm", name: "Panneaux de fibro-ciment, épaisseur 6.35mm", rsi: 0.019, description: "Panneaux de fibro-ciment, épaisseur 6.35mm", thickness: 6.35 },
    { id: "fibercement_8mm", name: "Panneaux de fibro-ciment, épaisseur 8mm", rsi: 0.024, description: "Panneaux de fibro-ciment, épaisseur 8mm", thickness: 8 },
    { id: "vinyl_siding", name: "Planche à clin en vinyle, sans endos", rsi: 0.11, description: "Planche à clin en vinyle, sans endos", thickness: 1 },
    { id: "vinyl_siding_insulated", name: "Planche à clin en vinyle avec endos isolé, épaisseur 9,5mm", rsi: 0.32, description: "Planche à clin avec endos isolé, épaisseur 9,5mm", thickness: 9.5 },
    { id: "vinyl_siding_insulated_foil", name: "Planche à clin avec endos isolé + pellicule aluminium, épaisseur 9,5mm", rsi: 0.52, description: "Planche à clin avec endos isolé + pellicule aluminium, épaisseur 9,5mm", thickness: 9.5 }
  ],
 
  // Matériaux de toiture
  roofingMaterials: [
    { id: "roll_roofing", name: "Recouvrement de toiture enduit de bitume (en rouleau)", rsi: 0.03, description: "Recouvrement de toiture enduit de bitume (en rouleau)", thickness: 2 },
    { id: "asphalt_shingles", name: "Bardeaux bitumés", rsi: 0.08, description: "Bardeaux bitumés", thickness: 3 },
    { id: "built_up_roofing", name: "Couverture multicouche (5 plis) de 10mm d'épaisseur", rsi: 0.06, description: "Couverture multicouche (5 plis) de 10mm d'épaisseur", thickness: 10 },
    { id: "wood_shingles_roof", name: "Bardeaux de bois", rsi: 0.17, description: "Bardeaux de bois", thickness: 10 },
    { id: "crushed_stone", name: "Pierre concassée", rsiPerMm: 0.0006, description: "Pierre concassée" },
    { id: "steel_deck", name: "Platelage d'acier", rsi: 0, description: "Platelage d'acier - négligeable", thickness: 1 },
    { id: "slate", name: "Ardoise, épaisseur 13mm", rsi: 0.01, description: "Ardoise, épaisseur 13mm", thickness: 13 }
  ],
 
  // Matériaux de finition intérieure
  interiorFinish: [
    { id: "gypsum_interior", name: "Plaque de plâtre (gypse)", rsiPerMm: 0.0061, description: "Plaque de plâtre (panneaux de gypse)" },
    { id: "hardboard_interior", name: "Panneaux de fibres dures", rsiPerMm: 0.0095, description: "Panneaux de fibres dures (800 kg/m³)" },
    { id: "interior_finishboard", name: "Panneaux intérieurs de finition", rsiPerMm: 0.0198, description: "Panneaux intérieurs de finition (carreaux ou planches)" },
    { id: "cement_interior", name: "Ciment, granulat de sable", rsiPerMm: 0.0014, description: "Ciment, granulat de sable" },
    { id: "plaster_sand", name: "Enduit au plâtre - agrégat de sable", rsiPerMm: 0.0012, description: "Enduit au plâtre - agrégat de sable" },
    { id: "plaster_light", name: "Enduit au plâtre - agrégat léger", rsiPerMm: 0.0044, description: "Enduit au plâtre - agrégat léger" },
    { id: "plywood_interior", name: "Contreplaqué", rsiPerMm: 0.0087, description: "Contreplaqué" }
  ]
};

// Options d'épaisseur communes pour les matériaux
const thicknessOptions = [
  { value: 3, label: "3 mm" },
  { value: 6, label: "6 mm" },
  { value: 9, label: "9 mm" },
  { value: 11, label: "11 mm (7/16\")" },
  { value: 12, label: "12.5 mm (1/2\")" },
  { value: 16, label: "15.9 mm (5/8\")" },
  { value: 19, label: "19 mm (3/4\")" },
  { value: 25, label: "25 mm (1\")" },
  { value: 38, label: "38 mm (1-1/2\")" },
  { value: 50, label: "50 mm (2\")" },
  { value: 64, label: "64 mm (2-1/2\")" },
  { value: 75, label: "75 mm (3\")" },
  { value: 89, label: "89 mm (3-1/2\")" },
  { value: 100, label: "100 mm (4\")" },
  { value: 140, label: "140 mm (5-1/2\")" },
  { value: 150, label: "150 mm (6\")" },
  { value: 190, label: "190 mm (7-1/2\")" },
  { value: 200, label: "200 mm (8\")" },
  { value: 250, label: "250 mm (10\")" },
  { value: 300, label: "300 mm (12\")" },
  { value: "custom", label: "Personnalisée..." }
];

// Variables globales
let location = "";
let degreeDays = "";
let climaticZone = "";
let buildingType = "residential_small";
let codeVersion = "part11";
let envelopeComponent = "wall_above_grade";
let layers = [];
let results = null;
let selectedLayerType = null;
let selectedLayerIndex = null;
let selectedMaterialCategory = null;
let selectedMaterialId = null;
let selectedThickness = 25;
let chart = null;

// Fonction pour calculer le point de rosée
function calculateDewPoint(temp, rh) {
  // Calculer la pression de vapeur d'eau
  function getSaturationPressure(temperature) {
    // Trouver les deux points les plus proches dans la table
    let lowerPoint = saturationTable[0];
    let upperPoint = saturationTable[saturationTable.length - 1];
    
    for (let i = 0; i < saturationTable.length; i++) {
      if (saturationTable[i].temp <= temperature) {
        lowerPoint = saturationTable[i];
      }
      if (saturationTable[i].temp >= temperature && saturationTable[i].temp < upperPoint.temp) {
        upperPoint = saturationTable[i];
      }
    }
    
    // Si les températures sont égales (par exemple, température exacte dans la table)
    if (lowerPoint.temp === upperPoint.temp) {
      return lowerPoint.pressure;
    }
    
    // Interpolation linéaire
    const ratio = (temperature - lowerPoint.temp) / (upperPoint.temp - lowerPoint.temp);
    return lowerPoint.pressure + ratio * (upperPoint.pressure - lowerPoint.pressure);
  }
  
  // Calculer la pression de vapeur d'eau actuelle
  const saturationPressure = getSaturationPressure(temp);
  const vaporPressure = (rh / 100) * saturationPressure;
  
  // Trouver la température de rosée (température à laquelle la pression de saturation = pression de vapeur actuelle)
  let dewPoint = -60; // Démarrer avec une valeur basse
  
  // Recherche par incréments de 0.1°C
  while (dewPoint < 65) {
    const pressureAtDewPoint = getSaturationPressure(dewPoint);
    if (Math.abs(pressureAtDewPoint - vaporPressure) < 0.01) {
      break;
    }
    if (pressureAtDewPoint > vaporPressure) {
      // Ajuster pour plus de précision
      dewPoint -= 0.1;
      break;
    }
    dewPoint += 0.1;
  }
  
  return Math.round(dewPoint * 10) / 10; // Arrondir à 0.1 près
}

// Fonction pour trouver la position du point de rosée
function findDewPointPosition(temperatures, positions, dewPoint) {
  let dewPointFound = false;
  let dewPointPosition = null;
  let dewPointMaterialIndex = null;
  
  for (let i = 0; i < temperatures.length - 1; i++) {
    // Si le point de rosée est entre deux températures
    if ((temperatures[i] <= dewPoint && temperatures[i+1] >= dewPoint) ||
        (temperatures[i] >= dewPoint && temperatures[i+1] <= dewPoint)) {
      dewPointFound = true;
      
      // Interpolation linéaire pour trouver la position exacte
      const ratio = Math.abs((dewPoint - temperatures[i]) / (temperatures[i+1] - temperatures[i]));
      dewPointPosition = positions[i] + ratio * (positions[i+1] - positions[i]);
      dewPointMaterialIndex = i;
      break;
    }
  }
  
  return {
    found: dewPointFound,
    position: dewPointPosition,
    materialIndex: dewPointMaterialIndex
  };
}

// Initialiser le sélecteur de municipalité
function initializeMunicipalitySelect() {
  const select = document.getElementById('location');
  
  // S'assurer que le select existe
  if (!select) {
    console.error("L'élément 'location' n'a pas été trouvé");
    return;
  }

  // Vider le select d'abord pour éviter les duplications
  select.innerHTML = '<option value="">Sélectionnez une municipalité</option>';
  
  // Trier les municipalités par nom
  const sortedMunicipalities = [...municipalities].sort((a, b) => a.name.localeCompare(b.name));
  
  sortedMunicipalities.forEach(municipality => {
    const option = document.createElement('option');
    option.value = municipality.id;
    option.textContent = `${municipality.name} (${municipality.degreeDay} degrés-jours)`;
    select.appendChild(option);
  });
}

// Mettre à jour les informations basées sur la municipalité
function updateLocation() {
  const select = document.getElementById('location');
  
  if (!select) {
    console.error("L'élément 'location' n'a pas été trouvé");
    return;
  }
  
  location = select.value;
  
  if (location) {
    const municipality = municipalities.find(m => m.id === location);
    if (municipality) {
      const degreeDaysInput = document.getElementById('degree-days');
      if (degreeDaysInput) {
        degreeDaysInput.value = municipality.degreeDay;
        degreeDays = municipality.degreeDay;
      }
      climaticZone = municipality.zone;
      updateClimaticZoneDisplay();
      updateMinRSIDisplay();
    }
  }
}

// Mettre à jour les informations basées sur les degrés-jours
function updateDegreeDays() {
  const input = document.getElementById('degree-days');
  
  if (!input) {
    console.error("L'élément 'degree-days' n'a pas été trouvé");
    return;
  }
  
  degreeDays = input.value;
  
  if (degreeDays && !isNaN(degreeDays)) {
    const dj = parseInt(degreeDays);
    climaticZone = dj < 6000 ? "< 6000" : ">= 6000";
    updateClimaticZoneDisplay();
    updateMinRSIDisplay();
  }
}

// Mettre à jour l'affichage de la zone climatique
function updateClimaticZoneDisplay() {
  const display = document.getElementById('climatic-zone-display');
  
  if (!display) {
    console.error("L'élément 'climatic-zone-display' n'a pas été trouvé");
    return;
  }
  
  if (climaticZone) {
    display.textContent = `Zone climatique: ${climaticZone === "< 6000" ? "Moins de 6000 degrés-jours" : "6000 degrés-jours ou plus"}`;
  } else {
    display.textContent = "";
  }
}

// Mettre à jour l'affichage des valeurs minimales de RSI
function updateMinRSIDisplay() {
  const rsiTotalDisplay = document.getElementById('min-rsit-display');
  const rsiEffectiveDisplay = document.getElementById('min-rsie-display');
  
  if (!rsiTotalDisplay || !rsiEffectiveDisplay) {
    console.error("Les éléments d'affichage RSI n'ont pas été trouvés");
    return;
  }
  
  if (climaticZone && envelopeComponent) {
    const rsiTotal = minRSITotalValues[climaticZone][envelopeComponent];
    const rsiEffective = minRSIEffectiveValues[climaticZone][envelopeComponent];
    
    rsiTotalDisplay.textContent = formatRSIR(rsiTotal);
    rsiEffectiveDisplay.textContent = formatRSIR(rsiEffective);
  } else {
    rsiTotalDisplay.textContent = "—";
    rsiEffectiveDisplay.textContent = "—";
  }
}

// Mettre à jour le type de bâtiment
function updateBuildingType() {
  const select = document.getElementById('building-type');
  
  if (!select) {
    console.error("L'élément 'building-type' n'a pas été trouvé");
    return;
  }
  
  buildingType = select.value;
}

// Mettre à jour la version du code
function updateCodeVersion() {
  const select = document.getElementById('code-version');
  
  if (!select) {
    console.error("L'élément 'code-version' n'a pas été trouvé");
    return;
  }
  
  codeVersion = select.value;
}

// Mettre à jour le composant d'enveloppe
function updateEnvelopeComponent() {
  const select = document.getElementById('envelope-component');
  
  if (!select) {
    console.error("L'élément 'envelope-component' n'a pas été trouvé");
    return;
  }
  
  envelopeComponent = select.value;
  updateMinRSIDisplay();
}

// Initialiser le graphique
function initializeChart() {
  const ctx = document.getElementById('chart').getContext('2d');
  
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Température (°C)',
        data: [],
        borderColor: '#1e88e5',
        backgroundColor: 'rgba(30, 136, 229, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Position (mm)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Température (°C)'
          }
        }
      }
    }
  });
}

// Mettre à jour le graphique avec les nouvelles données
function updateChart(positions, temperatures, dewPoint, dewPointPosition) {
  chart.data.labels = positions;
  chart.data.datasets[0].data = temperatures;
  
  // Ajouter la ligne horizontale pour le point de rosée
  chart.options.plugins.annotation = {
    annotations: {}
  };
  
  if (dewPoint !== null) {
    chart.options.plugins.annotation.annotations.dewPointLine = {
      type: 'line',
      yMin: dewPoint,
      yMax: dewPoint,
      borderColor: 'red',
      borderWidth: 2,
      borderDash: [5, 5],
      label: {
        content: `Point de rosée (${dewPoint.toFixed(1)}°C)`,
        position: 'right',
        color: 'red',
        enabled: true
      }
    };
  }
  
  if (dewPointPosition !== null) {
    chart.options.plugins.annotation.annotations.dewPointPosition = {
      type: 'line',
      xMin: dewPointPosition,
      xMax: dewPointPosition,
      borderColor: 'red',
      borderWidth: 2,
      borderDash: [5, 5]
    };
  }
  
  chart.update();
}

// Sélectionner un matériau
function selectMaterial(material) {
  selectedMaterialId = material.id;
  selectedMaterial = material;
  
  // Mettre à jour l'affichage de la résistance thermique
  const rsiDisplay = document.getElementById('material-rsi-display');
  const rsiValue = document.getElementById('material-rsi-value');
  const descriptionElem = document.getElementById('material-description');
  const thicknessSelector = document.getElementById('thickness-selector');
  
  if (!rsiDisplay || !rsiValue || !descriptionElem || !thicknessSelector) {
    console.error("Des éléments d'affichage du matériau sélectionné n'ont pas été trouvés");
    return;
  }
  
  // Si le matériau a une valeur RSI fixe
  if (material.rsi !== undefined) {
    rsiValue.textContent = formatRSIR(material.rsi);
    rsiDisplay.classList.remove('hidden');
    thicknessSelector.classList.add('hidden');
  } 
  // Si le matériau a une valeur RSI par mm (nécessite une épaisseur)
  else if (material.rsiPerMm !== undefined) {
    // Afficher le sélecteur d'épaisseur
    initializeThicknessSelector(material);
    thicknessSelector.classList.remove('hidden');
    
    // Calculer le RSI basé sur l'épaisseur par défaut ou existante
    const thickness = material.thickness || selectedThickness || 25;
    const rsi = material.rsiPerMm * thickness;
    rsiValue.textContent = formatRSIR(rsi);
    rsiDisplay.classList.remove('hidden');
  }
  
  // Afficher la description
  if (material.description) {
    descriptionElem.textContent = material.description;
  } else {
    descriptionElem.textContent = "";
  }
}

// Initialiser le sélecteur d'épaisseur
function initializeThicknessSelector(material) {
  const select = document.getElementById('thickness-select');
  const customThicknessDiv = document.getElementById('custom-thickness');
  const customThicknessInput = document.getElementById('custom-thickness-input');
  
  if (!select || !customThicknessDiv || !customThicknessInput) {
    console.error("Des éléments du sélecteur d'épaisseur n'ont pas été trouvés");
    return;
  }
  
  select.innerHTML = '';
  
  thicknessOptions.forEach(option => {
    const optElem = document.createElement('option');
    optElem.value = option.value;
    optElem.textContent = option.label;
    select.appendChild(optElem);
  });
  
  // Si le matériau a déjà une épaisseur définie, l'utiliser
  if (material.thickness) {
    // Trouver l'option correspondante ou mettre à "personnalisée"
    const matchingOption = thicknessOptions.find(opt => opt.value === material.thickness);
    select.value = matchingOption ? material.thickness : 'custom';
    
    if (select.value === 'custom') {
      customThicknessDiv.classList.remove('hidden');
      customThicknessInput.value = material.thickness;
    }
    
    selectedThickness = material.thickness;
  } else {
    // Valeur par défaut selon le type de matériau
    let defaultThickness = 25;
    if (selectedLayerType === 'insulation') defaultThickness = 89;
    if (selectedLayerType === 'sheathening') defaultThickness = 11;
    if (selectedLayerType === 'cladding') defaultThickness = 20;
    if (selectedLayerType === 'interior') defaultThickness = 13;
    if (selectedLayerType === 'structural') defaultThickness = 89;
    if (selectedLayerType === 'roofing') defaultThickness = 10;
    
    select.value = defaultThickness;
    selectedThickness = defaultThickness;
  }
}

// Gérer le changement d'épaisseur
function handleThicknessChange() {
  const select = document.getElementById('thickness-select');
  const customThicknessDiv = document.getElementById('custom-thickness');
  
  if (!select || !customThicknessDiv) {
    console.error("Des éléments du sélecteur d'épaisseur n'ont pas été trouvés");
    return;
  }
  
  if (select.value === 'custom') {
    customThicknessDiv.classList.remove('hidden');
    // Attendre que l'utilisateur entre une valeur
  } else {
    customThicknessDiv.classList.add('hidden');
    selectedThickness = parseInt(select.value);
    updateMaterialRSI();
  }
}

// Gérer le changement d'épaisseur personnalisée
function handleCustomThicknessChange() {
  const input = document.getElementById('custom-thickness-input');
  
  if (!input) {
    console.error("L'élément 'custom-thickness-input' n'a pas été trouvé");
    return;
  }
  
  selectedThickness = parseInt(input.value);
  updateMaterialRSI();
}

// Mettre à jour l'affichage du RSI en fonction de l'épaisseur
function updateMaterialRSI() {
  if (!selectedMaterial || !selectedMaterial.rsiPerMm) return;
  
  const rsiValueElem = document.getElementById('material-rsi-value');
  
  if (!rsiValueElem) {
    console.error("L'élément 'material-rsi-value' n'a pas été trouvé");
    return;
  }
  
  const rsi = selectedMaterial.rsiPerMm * selectedThickness;
  rsiValueElem.textContent = formatRSIR(rsi);
}
