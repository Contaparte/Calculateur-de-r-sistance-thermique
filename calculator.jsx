import { useState, useCallback, useMemo, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// DATA: MATERIALS DATABASE (from MERN Excel R02 - Tableau Résistances thermiques)
// ═══════════════════════════════════════════════════════════════════════════

const MATERIAL_CATEGORIES = [
  { id: "film_air", label: "Film d'air" },
  { id: "lame_air", label: "Lame d'air" },
  { id: "revetement", label: "Matériaux de revêtement" },
  { id: "toiture", label: "Matériaux de toiture" },
  { id: "revetement_inter", label: "Revêtement intermédiaire" },
  { id: "isolant_matelas", label: "Isolants en matelas" },
  { id: "isolant_panneau", label: "Isolants en panneaux" },
  { id: "isolant_vrac", label: "Isolants en vrac" },
  { id: "isolant_pulverise", label: "Isolants pulvérisés" },
  { id: "structuraux", label: "Matériaux structuraux" },
  { id: "blocs_beton", label: "Blocs de béton" },
  { id: "briques_argile", label: "Briques d'argile creuses" },
  { id: "finition_int", label: "Finition intérieure" },
  { id: "autre", label: "Autre (personnalisé)" },
];

const MATERIALS = [
  // Films d'air
  { id: "fa_ext", cat: "film_air", name: "Extérieur (vent 6,7 m/s)", rsiMm: null, rsi: 0.03, thick: null },
  { id: "fa_int_plaf", cat: "film_air", name: "Intérieur – Plafonds (flux ascendant)", rsiMm: null, rsi: 0.11, thick: null },
  { id: "fa_int_mur", cat: "film_air", name: "Intérieur – Murs (flux horizontal)", rsiMm: null, rsi: 0.12, thick: null },
  { id: "fa_int_planch", cat: "film_air", name: "Intérieur – Planchers (flux descendant)", rsiMm: null, rsi: 0.16, thick: null },
  // Lames d'air - Murs
  { id: "la_mur_9", cat: "lame_air", name: "Murs – Lame 9,5 mm", rsiMm: null, rsi: 0.15, thick: 9.5 },
  { id: "la_mur_13", cat: "lame_air", name: "Murs – Lame 13 mm", rsiMm: null, rsi: 0.16, thick: 13 },
  { id: "la_mur_20", cat: "lame_air", name: "Murs – Lame 20 mm", rsiMm: null, rsi: 0.18, thick: 20 },
  { id: "la_mur_40", cat: "lame_air", name: "Murs – Lame 40 mm", rsiMm: null, rsi: 0.18, thick: 40 },
  { id: "la_mur_90", cat: "lame_air", name: "Murs – Lame 90 mm", rsiMm: null, rsi: 0.18, thick: 90 },
  // Lames d'air - Plafonds
  { id: "la_plaf_9", cat: "lame_air", name: "Plafonds – Lame 9,5 mm", rsiMm: null, rsi: 0.15, thick: 9.5 },
  { id: "la_plaf_20", cat: "lame_air", name: "Plafonds – Lame 20 mm", rsiMm: null, rsi: 0.15, thick: 20 },
  { id: "la_plaf_90", cat: "lame_air", name: "Plafonds – Lame 90 mm", rsiMm: null, rsi: 0.16, thick: 90 },
  // Lames d'air - Planchers
  { id: "la_planch_20", cat: "lame_air", name: "Planchers – Lame 20 mm", rsiMm: null, rsi: 0.18, thick: 20 },
  { id: "la_planch_90", cat: "lame_air", name: "Planchers – Lame 90 mm", rsiMm: null, rsi: 0.22, thick: 90 },
  // Matériaux de revêtement
  { id: "rev_brique_argile_100", cat: "revetement", name: "Brique argile cuite – 100 mm", rsiMm: null, rsi: 0.07, thick: 100 },
  { id: "rev_brique_argile", cat: "revetement", name: "Brique argile cuite", rsiMm: 0.0007, rsi: null, thick: null },
  { id: "rev_brique_beton_100", cat: "revetement", name: "Brique béton – 100 mm", rsiMm: null, rsi: 0.04, thick: 100 },
  { id: "rev_brique_beton", cat: "revetement", name: "Brique béton", rsiMm: 0.0004, rsi: null, thick: null },
  { id: "rev_mortier_stuc", cat: "revetement", name: "Mortier et stucco", rsiMm: 0.0009, rsi: null, thick: null },
  { id: "rev_bard_bois_190", cat: "revetement", name: "Bardeaux de bois – Pureau 190 mm", rsiMm: null, rsi: 0.15, thick: null },
  { id: "rev_bard_bois_300", cat: "revetement", name: "Bardeaux de bois – Pureau double 300 mm", rsiMm: null, rsi: 0.21, thick: null },
  { id: "rev_bardage_metal_evide", cat: "revetement", name: "Bardage métal/vinyle – Endos évidé", rsiMm: null, rsi: 0.11, thick: null },
  { id: "rev_bardage_metal_isol", cat: "revetement", name: "Bardage métal/vinyle – Endos isolant 9,5 mm", rsiMm: null, rsi: 0.32, thick: 9.5 },
  { id: "rev_bardage_metal_alum", cat: "revetement", name: "Bardage métal/vinyle – Endos isolant alu 9,5 mm", rsiMm: null, rsi: 0.52, thick: 9.5 },
  { id: "rev_bard_bois_clin_13", cat: "revetement", name: "Bardage bois à clin 200 mm – 13 mm", rsiMm: null, rsi: 0.14, thick: 13 },
  { id: "rev_bard_bois_clin_20", cat: "revetement", name: "Bardage bois à clin 250 mm – 20 mm", rsiMm: null, rsi: 0.18, thick: 20 },
  { id: "rev_bard_bois_mibois", cat: "revetement", name: "Bardage bois à mi-bois 200 mm – 20 mm", rsiMm: null, rsi: 0.14, thick: 20 },
  { id: "rev_bard_bois_fibres", cat: "revetement", name: "Bardage bois – Panneaux fibres durs 11 mm", rsiMm: null, rsi: 0.12, thick: 11 },
  { id: "rev_bard_bois_cp", cat: "revetement", name: "Bardage bois – Contreplaqué 9,5 mm", rsiMm: null, rsi: 0.10, thick: 9.5 },
  { id: "rev_pierre_quartz", cat: "revetement", name: "Pierre – Quartzite et grès", rsiMm: 0.0003, rsi: null, thick: null },
  { id: "rev_pierre_calcite", cat: "revetement", name: "Pierre – Calcite, dolomite, calcaire, marbre, granite", rsiMm: 0.0004, rsi: null, thick: null },
  { id: "rev_fibrocim_6", cat: "revetement", name: "Bardage fibro-ciment – 6,35 mm", rsiMm: null, rsi: 0.019, thick: 6.35 },
  { id: "rev_fibrocim_8", cat: "revetement", name: "Bardage fibro-ciment – 8 mm", rsiMm: null, rsi: 0.024, thick: 8 },
  { id: "rev_fibrocim", cat: "revetement", name: "Bardage fibro-ciment", rsiMm: 0.003, rsi: null, thick: null },
  // Matériaux de toiture
  { id: "toit_bitume_roul", cat: "toiture", name: "Toiture bitume en rouleau", rsiMm: null, rsi: 0.03, thick: null },
  { id: "toit_asphalte", cat: "toiture", name: "Asphalte / goudron", rsiMm: 0.0014, rsi: null, thick: null },
  { id: "toit_multicouche", cat: "toiture", name: "Toiture multicouche – 10 mm", rsiMm: null, rsi: 0.06, thick: 10 },
  { id: "toit_pierre_conc", cat: "toiture", name: "Pierre concassée", rsiMm: 0.0006, rsi: null, thick: null },
  { id: "toit_platelage_acier", cat: "toiture", name: "Platelage d'acier", rsiMm: null, rsi: 0.0, thick: null },
  { id: "toit_bardeaux_bit", cat: "toiture", name: "Bardeaux bitumés", rsiMm: null, rsi: 0.08, thick: null },
  { id: "toit_bardeaux_bois", cat: "toiture", name: "Bardeaux de bois", rsiMm: null, rsi: 0.17, thick: null },
  { id: "toit_ardoise", cat: "toiture", name: "Ardoise – 13 mm", rsiMm: null, rsi: 0.01, thick: 13 },
  // Revêtement intermédiaire
  { id: "ri_platre_spec", cat: "revetement_inter", name: "Plaques plâtre spécialisées", rsiMm: 0.0063, rsi: null, thick: null },
  { id: "ri_fibres_isol", cat: "revetement_inter", name: "Panneaux fibres isolantes", rsiMm: 0.016, rsi: null, thick: null },
  { id: "ri_cp_tendre_9", cat: "revetement_inter", name: "Contreplaqué bois tendre – 9,5 mm", rsiMm: null, rsi: 0.083, thick: 9.5 },
  { id: "ri_cp_tendre_11", cat: "revetement_inter", name: "Contreplaqué bois tendre – 11 mm", rsiMm: null, rsi: 0.096, thick: 11 },
  { id: "ri_cp_tendre_12", cat: "revetement_inter", name: "Contreplaqué bois tendre – 12,5 mm", rsiMm: null, rsi: 0.109, thick: 12.5 },
  { id: "ri_cp_tendre", cat: "revetement_inter", name: "Contreplaqué bois tendre", rsiMm: 0.0087, rsi: null, thick: null },
  { id: "ri_cp_douglas_9", cat: "revetement_inter", name: "Contreplaqué Douglas – 9,5 mm", rsiMm: null, rsi: 0.105, thick: 9.5 },
  { id: "ri_cp_douglas_11", cat: "revetement_inter", name: "Contreplaqué Douglas – 11 mm", rsiMm: null, rsi: 0.122, thick: 11 },
  { id: "ri_cp_douglas", cat: "revetement_inter", name: "Contreplaqué Douglas", rsiMm: 0.0111, rsi: null, thick: null },
  { id: "ri_feutre", cat: "revetement_inter", name: "Feutre perméable", rsiMm: null, rsi: 0.011, thick: null },
  { id: "ri_membrane_plast", cat: "revetement_inter", name: "Membrane plastique", rsiMm: null, rsi: 0.0, thick: null },
  { id: "ri_osb_9", cat: "revetement_inter", name: "OSB – 9,5 mm", rsiMm: null, rsi: 0.093, thick: 9.5 },
  { id: "ri_osb_11", cat: "revetement_inter", name: "OSB – 11 mm", rsiMm: null, rsi: 0.108, thick: 11 },
  { id: "ri_osb", cat: "revetement_inter", name: "OSB", rsiMm: 0.0098, rsi: null, thick: null },
  { id: "ri_copeaux", cat: "revetement_inter", name: "Panneaux de copeaux", rsiMm: 0.0095, rsi: null, thick: null },
  { id: "ri_part_faible", cat: "revetement_inter", name: "Particules – Faible densité", rsiMm: 0.0098, rsi: null, thick: null },
  { id: "ri_part_moy", cat: "revetement_inter", name: "Particules – Moyenne densité", rsiMm: 0.0077, rsi: null, thick: null },
  // Isolants en matelas
  { id: "im_r12", cat: "isolant_matelas", name: "Fibre minérale R12", rsiMm: null, rsi: 2.11, thick: 89 },
  { id: "im_r14", cat: "isolant_matelas", name: "Fibre minérale R14", rsiMm: null, rsi: 2.46, thick: 89 },
  { id: "im_r19", cat: "isolant_matelas", name: "Fibre minérale R19 (R20 comprimé)", rsiMm: null, rsi: 3.34, thick: 140 },
  { id: "im_r20", cat: "isolant_matelas", name: "Fibre minérale R20", rsiMm: null, rsi: 3.52, thick: 152 },
  { id: "im_r22", cat: "isolant_matelas", name: "Fibre minérale R22", rsiMm: null, rsi: 3.87, thick: 140 },
  { id: "im_r22_5", cat: "isolant_matelas", name: "Fibre minérale R22,5", rsiMm: null, rsi: 3.96, thick: 152 },
  { id: "im_r24", cat: "isolant_matelas", name: "Fibre minérale R24", rsiMm: null, rsi: 4.23, thick: 140 },
  { id: "im_r28", cat: "isolant_matelas", name: "Fibre minérale R28", rsiMm: null, rsi: 4.93, thick: 178 },
  { id: "im_r31", cat: "isolant_matelas", name: "Fibre minérale R31", rsiMm: null, rsi: 5.46, thick: 241 },
  { id: "im_r35", cat: "isolant_matelas", name: "Fibre minérale R35", rsiMm: null, rsi: 6.16, thick: 267 },
  { id: "im_r40", cat: "isolant_matelas", name: "Fibre minérale R40", rsiMm: null, rsi: 7.04, thick: 279 },
  // Isolants en panneaux
  { id: "ip_toiture", cat: "isolant_panneau", name: "Panneau isolant pour toiture", rsiMm: 0.018, rsi: null, thick: null },
  { id: "ip_murs_carreaux", cat: "isolant_panneau", name: "Panneau isolant murs/plafonds (carreaux)", rsiMm: 0.016, rsi: null, thick: null },
  { id: "ip_polyiso_perm", cat: "isolant_panneau", name: "Polyisocyanurate – Surface perméable", rsiMm: 0.03818, rsi: null, thick: null },
  { id: "ip_polyiso_imp", cat: "isolant_panneau", name: "Polyisocyanurate – Surface imperméable", rsiMm: 0.03937, rsi: null, thick: null },
  { id: "ip_eps_t1", cat: "isolant_panneau", name: "Polystyrène expansé (EPS) – Type 1", rsiMm: 0.026, rsi: null, thick: null },
  { id: "ip_eps_t2", cat: "isolant_panneau", name: "Polystyrène expansé (EPS) – Type 2", rsiMm: 0.028, rsi: null, thick: null },
  { id: "ip_eps_t3", cat: "isolant_panneau", name: "Polystyrène expansé (EPS) – Type 3", rsiMm: 0.030, rsi: null, thick: null },
  { id: "ip_xps", cat: "isolant_panneau", name: "Polystyrène extrudé (XPS) – Types 2, 3, 4", rsiMm: 0.035, rsi: null, thick: null },
  { id: "ip_fibre_min_sr", cat: "isolant_panneau", name: "Fibre minérale semi-rigide", rsiMm: 0.0298, rsi: null, thick: null },
  // Isolants en vrac
  { id: "iv_cellulose", cat: "isolant_vrac", name: "Cellulose", rsiMm: 0.025, rsi: null, thick: null },
  { id: "iv_fibre_combles", cat: "isolant_vrac", name: "Fibre minérale pour combles", rsiMm: 0.01875, rsi: null, thick: null },
  { id: "iv_fibre_mur_89", cat: "isolant_vrac", name: "Fibre minérale pour murs – 89 mm", rsiMm: null, rsi: 2.55, thick: 89 },
  { id: "iv_fibre_mur_140", cat: "isolant_vrac", name: "Fibre minérale pour murs – 140 mm", rsiMm: null, rsi: 4.05, thick: 140 },
  { id: "iv_epandre", cat: "isolant_vrac", name: "Isolant à épandre pour combles", rsiMm: 0.2, rsi: null, thick: null },
  { id: "iv_perlite", cat: "isolant_vrac", name: "Perlite", rsiMm: 0.019, rsi: null, thick: null },
  { id: "iv_vermiculite", cat: "isolant_vrac", name: "Vermiculite", rsiMm: 0.015, rsi: null, thick: null },
  // Isolants pulvérisés
  { id: "ipu_pu_faible", cat: "isolant_pulverise", name: "Mousse polyuréthane pulvérisée – Faible densité", rsiMm: 0.0255, rsi: null, thick: null },
  { id: "ipu_pu_moy", cat: "isolant_pulverise", name: "Mousse polyuréthane pulvérisée – Moyenne densité", rsiMm: 0.036, rsi: null, thick: null },
  { id: "ipu_cellulose", cat: "isolant_pulverise", name: "Cellulose pulvérisée", rsiMm: 0.024, rsi: null, thick: null },
  { id: "ipu_verre_faible", cat: "isolant_pulverise", name: "Fibre de verre pulvérisée – Faible densité", rsiMm: 0.025, rsi: null, thick: null },
  { id: "ipu_verre_moy", cat: "isolant_pulverise", name: "Fibre de verre pulvérisée – Moyenne densité", rsiMm: 0.029, rsi: null, thick: null },
  // Matériaux structuraux
  { id: "st_acier", cat: "structuraux", name: "Acier – Feuille galvanisée", rsiMm: 0.0000161, rsi: null, thick: null },
  { id: "st_beton_faible_1600", cat: "structuraux", name: "Béton – Granulats faible densité (1600 kg/m³)", rsiMm: 0.0013, rsi: null, thick: null },
  { id: "st_beton_faible_480", cat: "structuraux", name: "Béton – Perlite, vermiculite, polystyrène (480 kg/m³)", rsiMm: 0.0063, rsi: null, thick: null },
  { id: "st_beton_normal", cat: "structuraux", name: "Béton – Densité normale (2400 kg/m³)", rsiMm: 0.0004, rsi: null, thick: null },
  { id: "st_bois_spf", cat: "structuraux", name: "Bois d'ossature – SPF", rsiMm: 0.0085, rsi: null, thick: null },
  { id: "st_bois_bouleau", cat: "structuraux", name: "Bois dur – Bouleau", rsiMm: 0.0055, rsi: null, thick: null },
  { id: "st_bois_chene", cat: "structuraux", name: "Bois dur – Chêne", rsiMm: 0.0056, rsi: null, thick: null },
  { id: "st_bois_erable", cat: "structuraux", name: "Bois dur – Érable", rsiMm: 0.0063, rsi: null, thick: null },
  { id: "st_bois_cedre", cat: "structuraux", name: "Bois tendre – Cèdre blanc", rsiMm: 0.0099, rsi: null, thick: null },
  { id: "st_bois_epinette", cat: "structuraux", name: "Bois tendre – Épinette blanche", rsiMm: 0.0097, rsi: null, thick: null },
  { id: "st_bois_pin_blanc", cat: "structuraux", name: "Bois tendre – Pin blanc", rsiMm: 0.0092, rsi: null, thick: null },
  { id: "st_bois_douglas", cat: "structuraux", name: "Bois tendre – Sapin Douglas-mélèze", rsiMm: 0.0069, rsi: null, thick: null },
  { id: "st_bois_thuya", cat: "structuraux", name: "Bois tendre – Thuya géant", rsiMm: 0.0102, rsi: null, thick: null },
  // Blocs de béton (sélection)
  { id: "bb_calc_perl_190", cat: "blocs_beton", name: "Calcaire – Perlite 190 mm", rsiMm: null, rsi: 0.37, thick: 190 },
  { id: "bb_calc_perl_290", cat: "blocs_beton", name: "Calcaire – Perlite 290 mm", rsiMm: null, rsi: 0.65, thick: 290 },
  { id: "bb_faible_vide_190", cat: "blocs_beton", name: "Faible densité – Vides 190 mm", rsiMm: null, rsi: 0.32, thick: 190 },
  { id: "bb_faible_perl_190", cat: "blocs_beton", name: "Faible densité – Perlite 190 mm", rsiMm: null, rsi: 0.99, thick: 190 },
  { id: "bb_faible_verm_190", cat: "blocs_beton", name: "Faible densité – Vermiculite 190 mm", rsiMm: null, rsi: 0.81, thick: 190 },
  { id: "bb_normal_vide_190", cat: "blocs_beton", name: "Densité normale – Vides 190 mm", rsiMm: null, rsi: 0.21, thick: 190 },
  { id: "bb_normal_vide_290", cat: "blocs_beton", name: "Densité normale – Vides 290 mm", rsiMm: null, rsi: 0.26, thick: 290 },
  { id: "bb_normal_verm_190", cat: "blocs_beton", name: "Densité normale – Vermiculite 190 mm", rsiMm: null, rsi: 0.51, thick: 190 },
  // Finition intérieure
  { id: "fi_placoplatre", cat: "finition_int", name: "Plaques de plâtre (gypse)", rsiMm: 0.0061, rsi: null, thick: null },
  { id: "fi_fibres_durs", cat: "finition_int", name: "Panneaux fibres durs", rsiMm: 0.0095, rsi: null, thick: null },
  { id: "fi_panneaux_fin", cat: "finition_int", name: "Panneaux intérieurs de finition", rsiMm: 0.0198, rsi: null, thick: null },
  { id: "fi_contreplaque", cat: "finition_int", name: "Contreplaqué", rsiMm: 0.0087, rsi: null, thick: null },
  { id: "fi_particules_f", cat: "finition_int", name: "Particules – Faible densité", rsiMm: 0.0098, rsi: null, thick: null },
  { id: "fi_particules_m", cat: "finition_int", name: "Particules – Moyenne densité", rsiMm: 0.0074, rsi: null, thick: null },
  { id: "fi_souscouche", cat: "finition_int", name: "Sous-couche – 15,9 mm", rsiMm: null, rsi: 0.14, thick: 15.9 },
  { id: "fi_enduit_sable", cat: "finition_int", name: "Enduit ciment – Granulats sable", rsiMm: 0.0014, rsi: null, thick: null },
  { id: "fi_enduit_leger", cat: "finition_int", name: "Enduit plâtre – Granulats faible densité", rsiMm: 0.0044, rsi: null, thick: null },
];

// ═══════════════════════════════════════════════════════════════════════════
// DATA: WOOD FRAMING PERCENTAGES (from MERN Excel R02)
// ═══════════════════════════════════════════════════════════════════════════

const WOOD_FRAMING_TYPES = [
  { group: "Planchers", items: [
    { name: "Solives en bois d'œuvre – Entraxe 406 mm", pctFrame: 13, pctCavity: 87 },
    { name: "Solives en bois d'œuvre – Entraxe 488 mm", pctFrame: 11.5, pctCavity: 88.5 },
    { name: "Solives en bois d'œuvre – Entraxe 610 mm", pctFrame: 10, pctCavity: 90 },
    { name: "Solives en I – Entraxe 406 mm", pctFrame: 9, pctCavity: 91 },
    { name: "Solives en I – Entraxe 488 mm", pctFrame: 7.5, pctCavity: 92.5 },
    { name: "Solives en I – Entraxe 610 mm", pctFrame: 6, pctCavity: 94 },
  ]},
  { group: "Toits et plafonds", items: [
    { name: "Fermes types – Entraxe 406 mm", pctFrame: 14, pctCavity: 86 },
    { name: "Fermes types – Entraxe 488 mm", pctFrame: 12.5, pctCavity: 87.5 },
    { name: "Fermes types – Entraxe 610 mm", pctFrame: 11, pctCavity: 89 },
    { name: "Fermes à chevrons relevés – Entraxe 406 mm", pctFrame: 10, pctCavity: 90 },
    { name: "Fermes à chevrons relevés – Entraxe 610 mm", pctFrame: 7, pctCavity: 93 },
    { name: "Chevrons bois d'œuvre – Entraxe 406 mm", pctFrame: 13, pctCavity: 87 },
    { name: "Chevrons bois d'œuvre – Entraxe 610 mm", pctFrame: 10, pctCavity: 90 },
    { name: "Chevrons type solive en I – Entraxe 406 mm", pctFrame: 9, pctCavity: 91 },
    { name: "Chevrons type solive en I – Entraxe 610 mm", pctFrame: 6, pctCavity: 94 },
    { name: "Panneaux structuraux isolés – Entraxe 1220 mm", pctFrame: 9, pctCavity: 91 },
  ]},
  { group: "Murs", items: [
    { name: "Ossature bois type – Entraxe 304 mm", pctFrame: 24.5, pctCavity: 75.5 },
    { name: "Ossature bois type – Entraxe 406 mm", pctFrame: 23, pctCavity: 77 },
    { name: "Ossature bois type – Entraxe 488 mm", pctFrame: 21.5, pctCavity: 78.5 },
    { name: "Ossature bois type – Entraxe 610 mm", pctFrame: 20, pctCavity: 80 },
    { name: "Ossature évoluée sablière jumelée – Entraxe 406 mm", pctFrame: 19, pctCavity: 81 },
    { name: "Ossature évoluée sablière jumelée – Entraxe 488 mm", pctFrame: 17.5, pctCavity: 82.5 },
    { name: "Ossature évoluée sablière jumelée – Entraxe 610 mm", pctFrame: 16, pctCavity: 84 },
    { name: "Panneaux structuraux isolés – Entraxe 1220 mm", pctFrame: 14, pctCavity: 86 },
  ]},
  { group: "Sous-sol", items: [
    { name: "Ossature bois intérieur fondation béton – Entraxe 406 mm", pctFrame: 16, pctCavity: 84 },
    { name: "Ossature bois intérieur fondation béton – Entraxe 488 mm", pctFrame: 14.5, pctCavity: 85.5 },
    { name: "Ossature bois intérieur fondation béton – Entraxe 610 mm", pctFrame: 13, pctCavity: 87 },
  ]},
];

// ═══════════════════════════════════════════════════════════════════════════
// DATA: METAL FRAMING (from MERN Excel R02)
// ═══════════════════════════════════════════════════════════════════════════

const METAL_FRAMING_TYPES = [
  { name: "Toits, plafonds et planchers – < 500 mm", pctFrame: 0.43, pctCavity: 99.57, spacing: "<500" },
  { name: "Toits, plafonds et planchers – ≥ 500 mm", pctFrame: 0.33, pctCavity: 99.67, spacing: ">=500" },
  { name: "Mur hors sol et fourrures – < 500 mm", pctFrame: 0.77, pctCavity: 99.23, spacing: "<500" },
  { name: "Mur hors sol et fourrures – ≥ 500 mm", pctFrame: 0.67, pctCavity: 99.33, spacing: ">=500" },
  { name: "Mur contact sol et fourrures – < 500 mm", pctFrame: 0.57, pctCavity: 99.43, spacing: "<500" },
  { name: "Mur contact sol et fourrures – ≥ 500 mm", pctFrame: 0.33, pctCavity: 99.67, spacing: ">=500" },
];

const METAL_K_VALUES = {
  "<500_sans": { k1: 0.33, k2: 0.67 },
  "<500_avec": { k1: 0.40, k2: 0.60 },
  ">=500": { k1: 0.50, k2: 0.50 },
};

// ═══════════════════════════════════════════════════════════════════════════
// DATA: CCQ 2020 Section 9.36 – Prescriptive RSI_E Requirements (Table 9.36.2.4.-A)
// ═══════════════════════════════════════════════════════════════════════════

const CLIMATE_ZONES = [
  { id: "z4", label: "Zone 4 (< 3000 DJC)", min: 0, max: 2999 },
  { id: "z5", label: "Zone 5 (3000–3999 DJC)", min: 3000, max: 3999 },
  { id: "z6", label: "Zone 6 (4000–4999 DJC)", min: 4000, max: 4999 },
  { id: "z7a", label: "Zone 7A (5000–5999 DJC)", min: 5000, max: 5999 },
  { id: "z7b", label: "Zone 7B (6000–6999 DJC)", min: 6000, max: 6999 },
  { id: "z8", label: "Zone 8 (≥ 7000 DJC)", min: 7000, max: 99999 },
];

const COMPONENT_TYPES = [
  { id: "plafond", label: "Plafond / Toit" },
  { id: "mur_hors_sol", label: "Mur hors sol" },
  { id: "mur_fondation", label: "Mur de fondation" },
  { id: "plancher_expose", label: "Plancher exposé" },
  { id: "dalle_sur_sol", label: "Dalle sur sol (périmètre)" },
];

// RSI_E prescriptive minimums by zone and component (CCQ 2020, Table 9.36.2.4.-A)
const RSI_REQUIREMENTS = {
  z4:  { plafond: 5.02, mur_hors_sol: 2.78, mur_fondation: 1.99, plancher_expose: 4.67, dalle_sur_sol: 1.32 },
  z5:  { plafond: 5.02, mur_hors_sol: 2.97, mur_fondation: 2.09, plancher_expose: 4.67, dalle_sur_sol: 1.32 },
  z6:  { plafond: 5.02, mur_hors_sol: 2.97, mur_fondation: 2.09, plancher_expose: 4.67, dalle_sur_sol: 1.32 },
  z7a: { plafond: 6.91, mur_hors_sol: 3.08, mur_fondation: 2.98, plancher_expose: 4.67, dalle_sur_sol: 1.76 },
  z7b: { plafond: 7.25, mur_hors_sol: 3.08, mur_fondation: 2.98, plancher_expose: 4.67, dalle_sur_sol: 1.76 },
  z8:  { plafond: 8.67, mur_hors_sol: 3.08, mur_fondation: 2.98, plancher_expose: 6.16, dalle_sur_sol: 2.20 },
};

// ═══════════════════════════════════════════════════════════════════════════
// DATA: MUNICIPALITIES
// ═══════════════════════════════════════════════════════════════════════════

const MUNICIPALITIES = [
  { name: "Alma", djc: 5680 }, { name: "Amos", djc: 5960 }, { name: "Baie-Comeau", djc: 5820 },
  { name: "Baie-Saint-Paul", djc: 5280 }, { name: "Beauport", djc: 5100 }, { name: "Bécancour", djc: 4810 },
  { name: "Beloeil", djc: 4500 }, { name: "Boucherville", djc: 4490 }, { name: "Brossard", djc: 4420 },
  { name: "Chambly", djc: 4550 }, { name: "Châteauguay", djc: 4350 }, { name: "Chicoutimi", djc: 5610 },
  { name: "Cowansville", djc: 4650 }, { name: "Dolbeau-Mistassini", djc: 5910 }, { name: "Drummondville", djc: 4810 },
  { name: "Gaspé", djc: 5350 }, { name: "Gatineau", djc: 4620 }, { name: "Granby", djc: 4700 },
  { name: "Joliette", djc: 4830 }, { name: "Jonquière", djc: 5590 }, { name: "La Malbaie", djc: 5630 },
  { name: "La Tuque", djc: 5670 }, { name: "Lac-Mégantic", djc: 5260 }, { name: "Laval", djc: 4430 },
  { name: "Lévis", djc: 5000 }, { name: "Longueuil", djc: 4420 }, { name: "Magog", djc: 4880 },
  { name: "Marieville", djc: 4610 }, { name: "Matane", djc: 5180 }, { name: "Mirabel", djc: 4640 },
  { name: "Mont-Laurier", djc: 5520 }, { name: "Mont-Tremblant", djc: 5200 }, { name: "Montmagny", djc: 5120 },
  { name: "Montréal", djc: 4270 }, { name: "Nicolet", djc: 4820 }, { name: "Québec", djc: 5100 },
  { name: "Repentigny", djc: 4520 }, { name: "Rimouski", djc: 5230 }, { name: "Rivière-du-Loup", djc: 5280 },
  { name: "Roberval", djc: 5720 }, { name: "Rouyn-Noranda", djc: 5920 }, { name: "Saint-Eustache", djc: 4530 },
  { name: "Saint-Georges", djc: 5100 }, { name: "Saint-Hyacinthe", djc: 4720 },
  { name: "Saint-Jean-sur-Richelieu", djc: 4490 }, { name: "Saint-Jérôme", djc: 4700 },
  { name: "Sainte-Adèle", djc: 5100 }, { name: "Sainte-Foy", djc: 5060 },
  { name: "Salaberry-de-Valleyfield", djc: 4290 }, { name: "Sept-Îles", djc: 5900 },
  { name: "Shawinigan", djc: 4960 }, { name: "Sherbrooke", djc: 4900 }, { name: "Sorel-Tracy", djc: 4700 },
  { name: "Terrebonne", djc: 4580 }, { name: "Thetford Mines", djc: 5120 },
  { name: "Trois-Rivières", djc: 4820 }, { name: "Val-d'Or", djc: 6050 },
  { name: "Varennes", djc: 4500 }, { name: "Victoriaville", djc: 4940 },
].sort((a, b) => a.name.localeCompare(b.name));

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function getClimateZone(djc) {
  return CLIMATE_ZONES.find(z => djc >= z.min && djc <= z.max) || CLIMATE_ZONES[0];
}

function computeLayerRSI(layer) {
  if (layer.materialId === "custom") return layer.customRsi || 0;
  const mat = MATERIALS.find(m => m.id === layer.materialId);
  if (!mat) return 0;
  if (mat.rsi !== null) return mat.rsi;
  if (mat.rsiMm !== null && layer.thickness > 0) return mat.rsiMm * layer.thickness;
  return 0;
}

function needsThickness(materialId) {
  if (materialId === "custom") return true;
  const mat = MATERIALS.find(m => m.id === materialId);
  if (!mat) return false;
  return mat.rsi === null && mat.rsiMm !== null;
}

function getDefaultThickness(materialId) {
  const mat = MATERIALS.find(m => m.id === materialId);
  if (!mat) return 0;
  return mat.thick || 0;
}

function fmtRSI(v) { return v != null ? v.toFixed(3) : "–"; }
function fmtR(v) { return v != null ? (v * 5.6786).toFixed(2) : "–"; } // Facteur MERN: 5.6786

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CALCULATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

function calculateResults(state) {
  const { layersExt, layersInt, structureType, framingConfig, cavityMaterialId, cavityThickness,
    frameMaterialId, frameThickness, pctFrame, pctCavity, metalIntermediate, metalSpacing } = state;

  // Sum continuous layers
  const rsiContExt = layersExt.reduce((s, l) => s + computeLayerRSI(l), 0);
  const rsiContInt = layersInt.reduce((s, l) => s + computeLayerRSI(l), 0);
  const rsiContTotal = rsiContExt + rsiContInt;

  if (structureType === "none") {
    // No framing - pure series
    const rsiE = rsiContTotal;
    return { rsiE, rsiT: rsiE, rsiContExt, rsiContInt, rsiO: 0, rsiC: 0, method: "Couches continues en série" };
  }

  // Compute frame RSI
  const frameMat = MATERIALS.find(m => m.id === frameMaterialId);
  let rsiFrame = 0;
  if (frameMat) {
    rsiFrame = frameMat.rsi !== null ? frameMat.rsi : (frameMat.rsiMm || 0) * (frameThickness || 0);
  }

  // Compute cavity RSI
  const cavMat = MATERIALS.find(m => m.id === cavityMaterialId);
  let rsiCavity = 0;
  if (cavMat) {
    rsiCavity = cavMat.rsi !== null ? cavMat.rsi : (cavMat.rsiMm || 0) * (cavityThickness || 0);
  }

  const pF = pctFrame / 100;
  const pC = pctCavity / 100;

  if (structureType === "wood") {
    // Isothermal planes method (série-parallèle)
    // RSI_parallel = 1 / (pF/rsiFrame + pC/rsiCavity)
    let rsiParallel = 0;
    if (rsiFrame > 0 && rsiCavity > 0) {
      rsiParallel = 1 / (pF / rsiFrame + pC / rsiCavity);
    } else if (rsiFrame > 0) {
      rsiParallel = rsiFrame;
    } else if (rsiCavity > 0) {
      rsiParallel = rsiCavity;
    }

    const rsiE = rsiContExt + rsiParallel + rsiContInt;
    const rsiT = rsiContExt + rsiCavity + rsiContInt; // At insulated section (no bridging)

    return {
      rsiE, rsiT, rsiContExt, rsiContInt, rsiO: rsiFrame, rsiC: rsiCavity,
      rsiParallel, pctFrame, pctCavity,
      method: "Plans isothermes (série-parallèle) – Ossature bois",
    };
  }

  if (structureType === "metal") {
    // Metal method: RSIE = K1 * RSImax + K2 * RSImin
    // Conformément à la méthode adaptée du MERN (flux parallèles et plans isothermes)

    // Chemins série complets
    const rsiAO = rsiContExt + rsiFrame + rsiContInt; // Chemin à travers l'ossature (acier)
    const rsiAC = rsiContExt + rsiCavity + rsiContInt; // Chemin à travers la cavité

    // RSImax = méthode des flux parallèles sur les chemins complets
    // Formule MERN (cellule T27): 100 / ((%AO/RSIAO) + (%AC/RSIAC))
    let rsiMax = 0;
    if (rsiAO > 0 && rsiAC > 0) {
      rsiMax = 1 / (pF / rsiAO + pC / rsiAC);
    }

    // RSImin = méthode des plans isothermes (série de parallèle)
    // RSI_// de la couche discontinue seule, puis en série avec les couches continues
    // Formule MERN (cellule I20): 100 / ((%AO/RSI_O) + (%AC/RSI_C))
    let rsiParallel = 0;
    if (rsiFrame > 0 && rsiCavity > 0) {
      rsiParallel = 1 / (pF / rsiFrame + pC / rsiCavity);
    }
    const rsiMin = rsiContExt + rsiParallel + rsiContInt;

    // Determine K1, K2
    let kKey;
    if (metalSpacing === ">=500") kKey = ">=500";
    else kKey = metalIntermediate ? "<500_avec" : "<500_sans";
    const { k1, k2 } = METAL_K_VALUES[kKey];

    // RSIE = K1 × RSImax + K2 × RSImin (formule MERN cellule R8)
    const rsiE = k1 * rsiMax + k2 * rsiMin;
    const rsiT = rsiContExt + rsiCavity + rsiContInt;

    return {
      rsiE, rsiT, rsiContExt, rsiContInt, rsiO: rsiFrame, rsiC: rsiCavity,
      rsiMax, rsiMin, rsiAO, rsiAC, rsiParallel, k1, k2,
      method: "Méthode adaptée (K1·RSImax + K2·RSImin) – Ossature métallique",
    };
  }

  return { rsiE: 0, rsiT: 0, rsiContExt: 0, rsiContInt: 0, rsiO: 0, rsiC: 0, method: "" };
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: LayerRow
// ═══════════════════════════════════════════════════════════════════════════

function LayerRow({ layer, index, onChange, onRemove }) {
  const mat = MATERIALS.find(m => m.id === layer.materialId);
  const rsi = computeLayerRSI(layer);
  const showThick = needsThickness(layer.materialId);
  const matsByCat = MATERIALS.filter(m => m.cat === layer.categoryId);

  return (
    <div className="layer-row">
      <div className="layer-num">{index + 1}</div>
      <div className="layer-fields">
        <select value={layer.categoryId} onChange={e => {
          const newCat = e.target.value;
          onChange({ ...layer, categoryId: newCat, materialId: "", thickness: 0 });
        }}>
          <option value="">— Catégorie —</option>
          {MATERIAL_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={layer.materialId} onChange={e => {
          const mid = e.target.value;
          const t = getDefaultThickness(mid);
          onChange({ ...layer, materialId: mid, thickness: t || layer.thickness });
        }}>
          <option value="">— Matériau —</option>
          {layer.categoryId === "autre"
            ? <option value="custom">Personnalisé</option>
            : matsByCat.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        {showThick && (
          <input type="number" className="thick-input" placeholder="mm"
            value={layer.thickness || ""} min={0} step={0.5}
            onChange={e => onChange({ ...layer, thickness: parseFloat(e.target.value) || 0 })} />
        )}
        {layer.materialId === "custom" && (
          <input type="number" className="rsi-input" placeholder="RSI"
            value={layer.customRsi || ""} min={0} step={0.001}
            onChange={e => onChange({ ...layer, customRsi: parseFloat(e.target.value) || 0 })} />
        )}
      </div>
      <div className="layer-rsi">{fmtRSI(rsi)}</div>
      <div className="layer-r">{fmtR(rsi)}</div>
      <button className="layer-remove" onClick={onRemove} title="Supprimer">×</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: Accordion Panel
// ═══════════════════════════════════════════════════════════════════════════

function Panel({ title, children, defaultOpen = true, badge = null }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="panel">
      <div className="panel-header" onClick={() => setOpen(!open)}>
        <div className="panel-title">
          <span>{title}</span>
          {badge && <span className="panel-badge">{badge}</span>}
        </div>
        <span className={`panel-chevron ${open ? "open" : ""}`}>‹</span>
      </div>
      {open && <div className="panel-body">{children}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════

const emptyLayer = () => ({ categoryId: "", materialId: "", thickness: 0, customRsi: 0 });

export default function App() {
  // Header
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [comments, setComments] = useState("");

  // Project params
  const [municipality, setMunicipality] = useState("");
  const [djc, setDjc] = useState(0);
  const [componentType, setComponentType] = useState("mur_hors_sol");
  const [structureType, setStructureType] = useState("wood");

  // Layers
  const [layersExt, setLayersExt] = useState([emptyLayer()]);
  const [layersInt, setLayersInt] = useState([emptyLayer()]);

  // Discontinuous layer - Wood
  const [woodFramingIdx, setWoodFramingIdx] = useState("");
  const [pctFrame, setPctFrame] = useState(23);
  const [pctCavity, setPctCavity] = useState(77);
  const [frameMaterialId, setFrameMaterialId] = useState("st_bois_spf");
  const [frameThickness, setFrameThickness] = useState(140);
  const [cavityMaterialId, setCavityMaterialId] = useState("");
  const [cavityCategoryId, setCavityCategoryId] = useState("isolant_matelas");
  const [cavityThickness, setCavityThickness] = useState(140);

  // Discontinuous layer - Metal
  const [metalFramingIdx, setMetalFramingIdx] = useState("");
  const [metalIntermediate, setMetalIntermediate] = useState(false);
  const [metalSpacing, setMetalSpacing] = useState("<500");

  // Zone
  const zone = useMemo(() => getClimateZone(djc), [djc]);
  const rsiRequired = RSI_REQUIREMENTS[zone.id]?.[componentType] || 0;

  // Results
  const results = useMemo(() => {
    return calculateResults({
      layersExt, layersInt, structureType, framingConfig: null,
      cavityMaterialId, cavityThickness, frameMaterialId, frameThickness,
      pctFrame, pctCavity, metalIntermediate, metalSpacing,
    });
  }, [layersExt, layersInt, structureType, cavityMaterialId, cavityThickness,
      frameMaterialId, frameThickness, pctFrame, pctCavity, metalIntermediate, metalSpacing]);

  const isCompliant = results.rsiE >= rsiRequired;

  // Handlers
  const handleMunicipality = (e) => {
    const mun = MUNICIPALITIES.find(m => m.name === e.target.value);
    setMunicipality(e.target.value);
    if (mun) setDjc(mun.djc);
  };

  const handleWoodFraming = (flatIdx) => {
    setWoodFramingIdx(flatIdx);
    let count = 0;
    for (const group of WOOD_FRAMING_TYPES) {
      for (const item of group.items) {
        if (String(count) === flatIdx) {
          setPctFrame(item.pctFrame);
          setPctCavity(item.pctCavity);
          return;
        }
        count++;
      }
    }
  };

  const handleMetalFraming = (idx) => {
    setMetalFramingIdx(idx);
    const item = METAL_FRAMING_TYPES[parseInt(idx)];
    if (item) {
      setPctFrame(item.pctFrame);
      setPctCavity(item.pctCavity);
      setMetalSpacing(item.spacing);
    }
  };

  const updateLayer = (arr, setArr, idx, newLayer) => {
    const copy = [...arr];
    copy[idx] = newLayer;
    setArr(copy);
  };

  const removeLayer = (arr, setArr, idx) => {
    if (arr.length <= 1) return;
    setArr(arr.filter((_, i) => i !== idx));
  };

  // Cavity materials filtered by category
  const cavityMats = MATERIALS.filter(m => m.cat === cavityCategoryId);

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-left">
          <h1>Calculateur RSI<sub>E</sub></h1>
          <p className="header-sub">Résistance thermique effective — Section 9.36 CCQ 2020</p>
        </div>
        <div className="header-result">
          <div className="result-label">RSI<sub>E</sub></div>
          <div className="result-value">{fmtRSI(results.rsiE)}</div>
          <div className="result-unit">(m²·K)/W</div>
          <div className="result-r">R-{fmtR(results.rsiE)}</div>
        </div>
      </header>

      {/* PANEL 1: Identification */}
      <Panel title="Identification du calcul" defaultOpen={false}>
        <div className="form-grid-2">
          <div className="field">
            <label>Description du calcul</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Mur extérieur type – Projet Canopée" />
          </div>
          <div className="field">
            <label>Fait par</label>
            <input value={author} onChange={e => setAuthor(e.target.value)} />
          </div>
          <div className="field">
            <label>Commentaires</label>
            <input value={comments} onChange={e => setComments(e.target.value)} />
          </div>
          <div className="field">
            <label>Date</label>
            <input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} />
          </div>
        </div>
      </Panel>

      {/* PANEL 2: Project parameters */}
      <Panel title="Paramètres du projet" badge={zone.label}>
        <div className="form-grid-3">
          <div className="field">
            <label>Municipalité</label>
            <select value={municipality} onChange={handleMunicipality}>
              <option value="">— Sélectionner —</option>
              {MUNICIPALITIES.map(m => <option key={m.name} value={m.name}>{m.name} ({m.djc} DJC)</option>)}
            </select>
          </div>
          <div className="field">
            <label>Degrés-jours sous 18 °C</label>
            <input type="number" value={djc || ""} onChange={e => setDjc(parseInt(e.target.value) || 0)} min={0} />
          </div>
          <div className="field">
            <label>Zone climatique</label>
            <div className="zone-display">{zone.label}</div>
          </div>
          <div className="field">
            <label>Composant d'enveloppe</label>
            <select value={componentType} onChange={e => setComponentType(e.target.value)}>
              {COMPONENT_TYPES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Type de structure</label>
            <select value={structureType} onChange={e => setStructureType(e.target.value)}>
              <option value="wood">Ossature de bois</option>
              <option value="metal">Ossature métallique</option>
              <option value="none">Sans ossature (couches continues)</option>
            </select>
          </div>
          <div className="field">
            <label>RSI<sub>E</sub> minimal exigé</label>
            <div className="zone-display requirement">{fmtRSI(rsiRequired)} (m²·K)/W</div>
          </div>
        </div>
      </Panel>

      {/* PANEL 3: Exterior continuous layers */}
      <Panel title="Couches continues extérieures" badge={`RSI ${fmtRSI(results.rsiContExt)}`}>
        <p className="section-hint">De l'extérieur vers la structure (items 1 à 10)</p>
        <div className="layers-header">
          <div className="layer-num">#</div>
          <div className="layer-fields">Catégorie / Matériau / Épaisseur</div>
          <div className="layer-rsi">RSI</div>
          <div className="layer-r">R</div>
          <div className="layer-remove-h"></div>
        </div>
        {layersExt.map((layer, i) => (
          <LayerRow key={i} layer={layer} index={i}
            onChange={newL => updateLayer(layersExt, setLayersExt, i, newL)}
            onRemove={() => removeLayer(layersExt, setLayersExt, i)} />
        ))}
        {layersExt.length < 10 && (
          <button className="btn-add" onClick={() => setLayersExt([...layersExt, emptyLayer()])}>
            + Ajouter une couche
          </button>
        )}
      </Panel>

      {/* PANEL 4: Discontinuous layer */}
      {structureType !== "none" && (
        <Panel title="Couche discontinue (ossature)" badge={
          structureType === "wood" ? "Plans isothermes" : "Méthode K1·K2"
        }>
          {structureType === "wood" && (
            <div className="discontinuous-section">
              <div className="form-grid-2">
                <div className="field">
                  <label>Type d'ensemble</label>
                  <select value={woodFramingIdx} onChange={e => handleWoodFraming(e.target.value)}>
                    <option value="">— Sélectionner —</option>
                    {(() => {
                      let count = 0;
                      return WOOD_FRAMING_TYPES.map(group => (
                        <optgroup key={group.group} label={group.group}>
                          {group.items.map(item => {
                            const idx = count++;
                            return <option key={idx} value={idx}>{item.name}</option>;
                          })}
                        </optgroup>
                      ));
                    })()}
                  </select>
                </div>
                <div className="pct-display">
                  <div><span className="pct-label">% Aire ossature:</span> <strong>{pctFrame}%</strong></div>
                  <div><span className="pct-label">% Aire cavité:</span> <strong>{pctCavity}%</strong></div>
                </div>
              </div>
              <div className="form-grid-2 mt-12">
                <div className="field-group">
                  <h4>Ossature</h4>
                  <div className="field">
                    <label>Matériau structural</label>
                    <select value={frameMaterialId} onChange={e => setFrameMaterialId(e.target.value)}>
                      {MATERIALS.filter(m => m.cat === "structuraux").map(m =>
                        <option key={m.id} value={m.id}>{m.name}</option>
                      )}
                    </select>
                  </div>
                  <div className="field">
                    <label>Épaisseur (mm)</label>
                    <input type="number" value={frameThickness} min={0}
                      onChange={e => setFrameThickness(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="computed-rsi">
                    RSI<sub>O</sub> = {fmtRSI((() => {
                      const m = MATERIALS.find(m => m.id === frameMaterialId);
                      if (!m) return 0;
                      return m.rsi !== null ? m.rsi : (m.rsiMm || 0) * frameThickness;
                    })())}
                  </div>
                </div>
                <div className="field-group">
                  <h4>Cavité</h4>
                  <div className="field">
                    <label>Catégorie</label>
                    <select value={cavityCategoryId} onChange={e => { setCavityCategoryId(e.target.value); setCavityMaterialId(""); }}>
                      {MATERIAL_CATEGORIES.filter(c =>
                        ["lame_air","isolant_matelas","isolant_panneau","isolant_vrac","isolant_pulverise","autre"].includes(c.id)
                      ).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Matériau de la cavité</label>
                    <select value={cavityMaterialId} onChange={e => {
                      setCavityMaterialId(e.target.value);
                      const t = getDefaultThickness(e.target.value);
                      if (t) setCavityThickness(t);
                    }}>
                      <option value="">— Sélectionner —</option>
                      {cavityMats.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  {needsThickness(cavityMaterialId) && (
                    <div className="field">
                      <label>Épaisseur (mm)</label>
                      <input type="number" value={cavityThickness} min={0}
                        onChange={e => setCavityThickness(parseFloat(e.target.value) || 0)} />
                    </div>
                  )}
                  <div className="computed-rsi">
                    RSI<sub>C</sub> = {fmtRSI((() => {
                      const m = MATERIALS.find(m => m.id === cavityMaterialId);
                      if (!m) return 0;
                      return m.rsi !== null ? m.rsi : (m.rsiMm || 0) * cavityThickness;
                    })())}
                  </div>
                </div>
              </div>
            </div>
          )}

          {structureType === "metal" && (
            <div className="discontinuous-section">
              <div className="form-grid-3">
                <div className="field">
                  <label>Ensemble</label>
                  <select value={metalFramingIdx} onChange={e => handleMetalFraming(e.target.value)}>
                    <option value="">— Sélectionner —</option>
                    {METAL_FRAMING_TYPES.map((item, i) =>
                      <option key={i} value={i}>{item.name}</option>
                    )}
                  </select>
                </div>
                <div className="field">
                  <label>Revêtement intermédiaire isolant</label>
                  <select value={metalIntermediate ? "oui" : "non"} onChange={e => setMetalIntermediate(e.target.value === "oui")}>
                    <option value="non">Non</option>
                    <option value="oui">Oui</option>
                  </select>
                </div>
                <div className="pct-display">
                  <div><span className="pct-label">% ossature:</span> <strong>{pctFrame}%</strong></div>
                  <div><span className="pct-label">% cavité:</span> <strong>{pctCavity}%</strong></div>
                  <div><span className="pct-label">K1 / K2:</span> <strong>
                    {(() => {
                      let kKey = metalSpacing === ">=500" ? ">=500" : (metalIntermediate ? "<500_avec" : "<500_sans");
                      const kv = METAL_K_VALUES[kKey];
                      return `${kv.k1} / ${kv.k2}`;
                    })()}
                  </strong></div>
                </div>
              </div>
              <div className="form-grid-2 mt-12">
                <div className="field-group">
                  <h4>Cavité</h4>
                  <div className="field">
                    <label>Catégorie</label>
                    <select value={cavityCategoryId} onChange={e => { setCavityCategoryId(e.target.value); setCavityMaterialId(""); }}>
                      {MATERIAL_CATEGORIES.filter(c =>
                        ["isolant_matelas","isolant_panneau","isolant_vrac","isolant_pulverise"].includes(c.id)
                      ).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Matériau</label>
                    <select value={cavityMaterialId} onChange={e => {
                      setCavityMaterialId(e.target.value);
                      const t = getDefaultThickness(e.target.value);
                      if (t) setCavityThickness(t);
                    }}>
                      <option value="">— Sélectionner —</option>
                      {cavityMats.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  {needsThickness(cavityMaterialId) && (
                    <div className="field">
                      <label>Épaisseur (mm)</label>
                      <input type="number" value={cavityThickness} min={0}
                        onChange={e => setCavityThickness(parseFloat(e.target.value) || 0)} />
                    </div>
                  )}
                </div>
                <div className="field-group">
                  <h4>Épaisseur de l'ossature</h4>
                  <div className="field">
                    <label>Épaisseur (mm)</label>
                    <input type="number" value={frameThickness} min={0}
                      onChange={e => setFrameThickness(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </Panel>
      )}

      {/* PANEL 5: Interior continuous layers */}
      <Panel title="Couches continues intérieures" badge={`RSI ${fmtRSI(results.rsiContInt)}`}>
        <p className="section-hint">De la structure vers l'intérieur (items 11 à 20)</p>
        <div className="layers-header">
          <div className="layer-num">#</div>
          <div className="layer-fields">Catégorie / Matériau / Épaisseur</div>
          <div className="layer-rsi">RSI</div>
          <div className="layer-r">R</div>
          <div className="layer-remove-h"></div>
        </div>
        {layersInt.map((layer, i) => (
          <LayerRow key={i} layer={layer} index={i}
            onChange={newL => updateLayer(layersInt, setLayersInt, i, newL)}
            onRemove={() => removeLayer(layersInt, setLayersInt, i)} />
        ))}
        {layersInt.length < 10 && (
          <button className="btn-add" onClick={() => setLayersInt([...layersInt, emptyLayer()])}>
            + Ajouter une couche
          </button>
        )}
      </Panel>

      {/* PANEL 6: Results */}
      <Panel title="Résultats" badge={isCompliant ? "✓ Conforme" : "✗ Non conforme"}>
        <div className="results-section">
          <div className="results-main">
            <div className={`compliance-card ${isCompliant ? "pass" : "fail"}`}>
              <div className="compliance-icon">{isCompliant ? "✓" : "✗"}</div>
              <div className="compliance-text">
                <div className="compliance-status">{isCompliant ? "CONFORME" : "NON CONFORME"}</div>
                <div className="compliance-detail">
                  RSI<sub>E</sub> = {fmtRSI(results.rsiE)} {isCompliant ? "≥" : "<"} {fmtRSI(rsiRequired)} (exigé)
                </div>
              </div>
            </div>
          </div>

          <div className="results-table">
            <table>
              <thead>
                <tr>
                  <th>Mesure</th>
                  <th>Valeur RSI (m²·K)/W</th>
                  <th>Valeur R (pi²·°F·h/Btu)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Couches continues extérieures</td>
                  <td>{fmtRSI(results.rsiContExt)}</td>
                  <td>{fmtR(results.rsiContExt)}</td>
                </tr>
                {structureType !== "none" && (
                  <>
                    <tr>
                      <td>RSI ossature (RSI<sub>O</sub>)</td>
                      <td>{fmtRSI(results.rsiO)}</td>
                      <td>{fmtR(results.rsiO)}</td>
                    </tr>
                    <tr>
                      <td>RSI cavité (RSI<sub>C</sub>)</td>
                      <td>{fmtRSI(results.rsiC)}</td>
                      <td>{fmtR(results.rsiC)}</td>
                    </tr>
                    {results.rsiParallel != null && (
                      <tr>
                        <td>RSI parallèle (couche discontinue)</td>
                        <td>{fmtRSI(results.rsiParallel)}</td>
                        <td>{fmtR(results.rsiParallel)}</td>
                      </tr>
                    )}
                    {results.rsiMax != null && (
                      <>
                        <tr><td>RSI<sub>AO</sub> (chemin ossature, en série)</td><td>{fmtRSI(results.rsiAO)}</td><td>{fmtR(results.rsiAO)}</td></tr>
                        <tr><td>RSI<sub>AC</sub> (chemin cavité, en série)</td><td>{fmtRSI(results.rsiAC)}</td><td>{fmtR(results.rsiAC)}</td></tr>
                        <tr><td>RSI<sub>max</sub> (flux parallèles)</td><td>{fmtRSI(results.rsiMax)}</td><td>{fmtR(results.rsiMax)}</td></tr>
                        <tr><td>RSI<sub>min</sub> (plans isothermes)</td><td>{fmtRSI(results.rsiMin)}</td><td>{fmtR(results.rsiMin)}</td></tr>
                        <tr><td>K1 / K2</td><td colSpan={2}>{results.k1} / {results.k2}</td></tr>
                      </>
                    )}
                  </>
                )}
                <tr>
                  <td>Couches continues intérieures</td>
                  <td>{fmtRSI(results.rsiContInt)}</td>
                  <td>{fmtR(results.rsiContInt)}</td>
                </tr>
                <tr className="row-total">
                  <td>Résistance thermique effective (RSI<sub>E</sub>)</td>
                  <td><strong>{fmtRSI(results.rsiE)}</strong></td>
                  <td><strong>{fmtR(results.rsiE)}</strong></td>
                </tr>
                <tr className="row-total-light">
                  <td>Résistance thermique totale (RSI<sub>T</sub>)</td>
                  <td>{fmtRSI(results.rsiT)}</td>
                  <td>{fmtR(results.rsiT)}</td>
                </tr>
                <tr className="row-total-light">
                  <td>Coefficient U effectif</td>
                  <td colSpan={2}>{results.rsiE > 0 ? (1 / results.rsiE).toFixed(4) : "–"} W/(m²·K)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="method-note">
            <strong>Méthode de calcul :</strong> {results.method}
          </div>
        </div>
      </Panel>

      {/* PANEL 7: Disclaimer */}
      <Panel title="Avertissement" defaultOpen={false}>
        <div className="disclaimer">
          <p><strong>Nature de l'outil :</strong> Ce calculateur est un outil éducatif et technique basé sur le Code de construction du Québec, Chapitre I – Bâtiment, et Code national du bâtiment – Canada 2020 (modifié), et notamment la Section 9.36 relative à l'efficacité énergétique. Il permet d'effectuer les calculs de résistance thermique effective conformément à l'article 9.36.2.4. et aux méthodes simplifiées autorisées (plans isothermes pour ossature bois, méthode K1/K2 pour ossature métallique).</p>
          <p>Cet outil <strong>n'est pas un rapport d'expertise professionnel</strong>. Les résultats générés sont fournis à titre indicatif. L'utilisateur demeure responsable de valider la conformité des résultats auprès d'un professionnel qualifié ou de l'autorité compétente.</p>
          <p>Les valeurs de résistance thermique des matériaux proviennent du Tableau A-9.36.2.4. 1)-D du Code national du bâtiment – Canada 2020 et de l'outil de calcul du MERN (Ministère de l'Énergie et des Ressources naturelles). Les pourcentages d'aire d'ossature proviennent des tableaux A-9.36.2.4. 1)-A et A-9.36.2.4. 1)-B.</p>
        </div>
      </Panel>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .app-root {
          font-family: 'DM Sans', system-ui, sans-serif;
          background: #0c1117;
          color: #c9d1d9;
          min-height: 100vh;
          padding: 20px;
          max-width: 960px;
          margin: 0 auto;
        }

        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          background: linear-gradient(135deg, #161b22, #1a2332);
          border: 1px solid #30363d;
          border-radius: 12px;
          margin-bottom: 16px;
        }
        .header-left h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #e6edf3;
          letter-spacing: -0.02em;
        }
        .header-left h1 sub { font-size: 0.7em; }
        .header-sub {
          color: #7d8590;
          font-size: 0.85rem;
          margin-top: 4px;
        }
        .header-result {
          text-align: right;
          background: #0d1117;
          border: 1px solid #238636;
          border-radius: 10px;
          padding: 12px 20px;
        }
        .result-label { color: #7d8590; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; }
        .result-label sub { font-size: 0.8em; }
        .result-value { font-family: 'JetBrains Mono', monospace; font-size: 1.8rem; font-weight: 700; color: #58a6ff; line-height: 1.1; }
        .result-unit { color: #7d8590; font-size: 0.7rem; }
        .result-r { color: #8b949e; font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

        .panel {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 10px;
          margin-bottom: 12px;
          overflow: hidden;
        }
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          cursor: pointer;
          user-select: none;
          transition: background 0.15s;
        }
        .panel-header:hover { background: #1c2333; }
        .panel-title { display: flex; align-items: center; gap: 10px; font-weight: 600; color: #e6edf3; font-size: 0.95rem; }
        .panel-badge {
          font-size: 0.7rem;
          font-weight: 500;
          background: #1f6feb22;
          color: #58a6ff;
          padding: 2px 10px;
          border-radius: 20px;
          font-family: 'JetBrains Mono', monospace;
        }
        .panel-chevron {
          color: #7d8590;
          font-size: 1.2rem;
          transition: transform 0.2s;
          transform: rotate(-90deg);
        }
        .panel-chevron.open { transform: rotate(-270deg); }
        .panel-body { padding: 16px 20px 20px; border-top: 1px solid #21262d; }

        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
        .mt-12 { margin-top: 14px; }

        .field label {
          display: block;
          font-size: 0.75rem;
          color: #7d8590;
          margin-bottom: 4px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .field label sub { font-size: 0.85em; }
        .field select, .field input {
          width: 100%;
          padding: 8px 10px;
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 6px;
          color: #c9d1d9;
          font-size: 0.85rem;
          font-family: inherit;
          transition: border-color 0.15s;
        }
        .field select:focus, .field input:focus { outline: none; border-color: #58a6ff; }
        .field select { cursor: pointer; }

        .zone-display {
          padding: 8px 10px;
          background: #1f6feb15;
          border: 1px solid #1f6feb44;
          border-radius: 6px;
          color: #58a6ff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .zone-display.requirement { color: #f0883e; border-color: #f0883e44; background: #f0883e15; }

        .section-hint { color: #7d8590; font-size: 0.8rem; margin-bottom: 12px; font-style: italic; }

        .layers-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          border-bottom: 1px solid #21262d;
          font-size: 0.7rem;
          color: #7d8590;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 600;
        }
        .layer-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          border-bottom: 1px solid #21262d11;
        }
        .layer-num { width: 28px; text-align: center; color: #484f58; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
        .layer-fields {
          flex: 1;
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .layer-fields select {
          flex: 1;
          min-width: 140px;
          padding: 6px 8px;
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 5px;
          color: #c9d1d9;
          font-size: 0.8rem;
          font-family: inherit;
        }
        .layer-fields select:focus { outline: none; border-color: #58a6ff; }
        .thick-input, .rsi-input {
          width: 80px !important;
          padding: 6px 8px;
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 5px;
          color: #c9d1d9;
          font-size: 0.8rem;
          font-family: 'JetBrains Mono', monospace;
        }
        .thick-input:focus, .rsi-input:focus { outline: none; border-color: #58a6ff; }
        .layer-rsi, .layer-r {
          width: 64px;
          text-align: right;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          color: #58a6ff;
        }
        .layer-r { color: #8b949e; }
        .layer-remove {
          width: 28px;
          height: 28px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 6px;
          color: #484f58;
          font-size: 1.1rem;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .layer-remove:hover { background: #da3633; color: white; border-color: #da3633; }
        .layer-remove-h { width: 28px; }

        .btn-add {
          margin-top: 10px;
          padding: 7px 14px;
          background: transparent;
          border: 1px dashed #30363d;
          border-radius: 6px;
          color: #58a6ff;
          font-size: 0.8rem;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .btn-add:hover { border-color: #58a6ff; background: #1f6feb11; }

        .discontinuous-section { }
        .pct-display {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 8px 12px;
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 6px;
          font-size: 0.85rem;
        }
        .pct-label { color: #7d8590; }
        .pct-display strong { color: #e6edf3; font-family: 'JetBrains Mono', monospace; }

        .field-group {
          padding: 12px;
          background: #0d111788;
          border: 1px solid #21262d;
          border-radius: 8px;
        }
        .field-group h4 { color: #e6edf3; font-size: 0.85rem; margin-bottom: 10px; font-weight: 600; }
        .field-group .field { margin-bottom: 8px; }
        .computed-rsi {
          margin-top: 8px;
          padding: 6px 10px;
          background: #1f6feb11;
          border-radius: 5px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          color: #58a6ff;
        }
        .computed-rsi sub { font-size: 0.8em; }

        .results-section { }
        .results-main { margin-bottom: 16px; }
        .compliance-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-radius: 8px;
          border: 1px solid;
        }
        .compliance-card.pass { background: #23863611; border-color: #238636; }
        .compliance-card.fail { background: #da363311; border-color: #da3633; }
        .compliance-icon { font-size: 2rem; }
        .compliance-card.pass .compliance-icon { color: #3fb950; }
        .compliance-card.fail .compliance-icon { color: #f85149; }
        .compliance-status { font-weight: 700; font-size: 1rem; letter-spacing: 0.06em; }
        .compliance-card.pass .compliance-status { color: #3fb950; }
        .compliance-card.fail .compliance-status { color: #f85149; }
        .compliance-detail { font-size: 0.85rem; color: #8b949e; margin-top: 2px; }
        .compliance-detail sub { font-size: 0.8em; }

        .results-table { overflow-x: auto; }
        .results-table table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        .results-table th {
          text-align: left;
          padding: 8px 12px;
          background: #21262d;
          color: #7d8590;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .results-table td {
          padding: 8px 12px;
          border-bottom: 1px solid #21262d;
        }
        .results-table td sub { font-size: 0.8em; }
        .results-table td:not(:first-child) {
          font-family: 'JetBrains Mono', monospace;
          text-align: right;
          color: #8b949e;
        }
        .row-total td { background: #1f6feb0d; font-weight: 600; }
        .row-total td:not(:first-child) { color: #58a6ff !important; }
        .row-total-light td { background: #0d111744; }

        .method-note {
          margin-top: 14px;
          padding: 10px 14px;
          background: #0d1117;
          border: 1px solid #21262d;
          border-radius: 6px;
          font-size: 0.8rem;
          color: #7d8590;
        }
        .method-note strong { color: #8b949e; }

        .disclaimer {
          font-size: 0.82rem;
          color: #7d8590;
          line-height: 1.6;
        }
        .disclaimer p { margin-bottom: 10px; }
        .disclaimer strong { color: #e6edf3; }

        @media (max-width: 700px) {
          .app-header { flex-direction: column; gap: 16px; }
          .header-result { text-align: center; width: 100%; }
          .form-grid-2, .form-grid-3 { grid-template-columns: 1fr; }
          .layer-fields { flex-direction: column; }
          .layer-fields select { min-width: 0; }
        }
      `}</style>
    </div>
  );
}
