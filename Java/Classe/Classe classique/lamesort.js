// Création du graphique radar des caractéristiques
const ctx = document.getElementById('statsChart').getContext('2d');

// Données de base de Lame-Sort (échelle de -4 à +6)
const baseStats = {
    FOR: -2,
    CST: -1,
    DEX: 3,
    INT: 3,
    SAG: 3,
    PER: 0,
    CHA: -3
};

const parcoursOptions = {
    'clan-desert': {
        name: 'Clan du Désert',
        bonuses: { INT: 3, DEX: 3 },
        details: '+1 en Instinct, en Savoir ou en Sang-froid · Amélioration en Enchantement ou en Insufflation · Écoute des Rémanences'
    },
    'maison-korrina': {
        name: 'Maison Korrina',
        bonuses: { PER: 3, DEX: 3 },
        details: "+1 en Finesse, en Social ou en Sang-froid · Furtivité Silencieuse · Dialecte Criminel · Lame de l'Ombre Korrina"
    },
    'monde-souterrain': {
        name: 'Monde Souterrain',
        bonuses: { SAG: 3 },
        replacements: { CST: 3 },
        details: "+1 en Métier, en Sang-froid ou en Résilience · Héritage des Forges Souterraines · Forge d'Essence Runelame"
    },
    'guerrier-elementaire': {
        name: 'Guerrier Élémentaire',
        bonuses: { INT: 3 },
        replacements: { CST: 2 },
        details: '+1 en Savoir, en Résilience ou en Puissance · Âme de la Runelame · Clairvoyance Runique'
    },
    'champion-desert': {
        name: "Combattant Avant l'Art — « Champion du Désert »",
        replacements: { FOR: 3 },
        details: 'Réactivité +5 (total +8) · +1 en Puissance, en Résilience ou en Finesse · Héritage du Champion des Dunes · Fureur du Champion Runelame'
    }
};

let currentParcours = null;

// Fonction pour calculer les stats avec bonus
function calculateStats(parcours) {
    const { bonuses = {}, replacements = {} } = parcoursOptions[parcours] ?? {};
    const stats = { ...baseStats, ...replacements };
    for (const [stat, bonus] of Object.entries(bonuses)) {
        stats[stat] += bonus;
    }
    return stats;
}

// Décaler l'échelle radiale pour représenter les valeurs négatives.
function convertStatsForChart(stats) {
    return Object.values(stats).map(val => val + 4);
}

// Création du graphique Chart.js
const statsChart = new Chart(ctx, {
    type: 'radar',
    data: {
        labels: ['FOR', 'CST', 'DEX', 'INT', 'SAG', 'PER', 'CHA'],
        datasets: [{
            label: 'Caractéristiques',
            data: convertStatsForChart(baseStats),
            backgroundColor: 'rgba(212, 165, 116, 0.2)',
            borderColor: 'rgba(212, 165, 116, 0.8)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(212, 165, 116, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(212, 165, 116, 1)',
            pointRadius: 5,
            pointHoverRadius: 7
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: {
            duration: 800,
            easing: 'easeInOutQuart'
        },
        scales: {
            r: {
                min: 0,
                max: 10,
                ticks: {
                    stepSize: 2,
                    callback: function(value) {
                        return value - 4;
                    },
                    color: '#7a5230',
                    font: {
                        size: 11,
                        weight: 'bold'
                    }
                },
                grid: {
                    color: 'rgba(122, 82, 48, 0.2)'
                },
                angleLines: {
                    color: 'rgba(122, 82, 48, 0.2)'
                },
                pointLabels: {
                    color: '#7a5230',
                    font: {
                        size: 14,
                        weight: 'bold',
                        family: "'Cinzel', serif"
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const actualValue = context.parsed.r - 4;
                        return context.label + ': ' + (actualValue >= 0 ? '+' : '') + actualValue;
                    }
                }
            }
        }
    }
});

// Fonction pour mettre à jour le graphique
function updateChart(parcours) {
    const newStats = calculateStats(parcours);
    statsChart.data.datasets[0].data = convertStatsForChart(newStats);
    statsChart.update();
    currentParcours = parcours;
    
    // Mettre à jour l'indicateur visuel
    updateParcoursSelection(parcours);
    updateStatsDisplay(parcours);
}

// Fonction pour mettre à jour l'affichage de la sélection
function updateParcoursSelection(parcours) {
    // Retirer la classe selected de toutes les cartes
    document.querySelectorAll('.parcours-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Ajouter la classe selected à la carte choisie
    if (parcours) {
        const selectedCard = document.querySelector(`.parcours-card.${parcours}`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

// Fonction pour afficher les stats actuelles
function updateStatsDisplay(parcours) {
    const displayElement = document.getElementById('current-parcours-display');
    if (!displayElement) return;

    if (parcours) {
        const { name, bonuses = {}, replacements = {}, details } = parcoursOptions[parcours];
        const changes = [
            ...Object.entries(bonuses).map(([stat, bonus]) => `${stat} +${bonus}`),
            ...Object.entries(replacements).map(([stat, value]) => `${stat} ${baseStats[stat]} → +${value}`)
        ];

        displayElement.innerHTML = `
            <strong>Parcours sélectionné :</strong> ${name}<br>
            <strong>Caractéristiques :</strong> ${changes.join(' · ')}<br>
            <strong>Autres gains :</strong> ${details}
        `;
        displayElement.style.display = 'block';
    } else {
        displayElement.innerHTML = '<strong>Aucun Parcours sélectionné</strong> - Stats de base affichées';
        displayElement.style.display = 'block';
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    const parcoursCards = document.querySelectorAll('.parcours-card');
    
    // Ajouter les événements de clic sur les cartes de parcours
    parcoursCards.forEach(card => {
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', function() {
            if (!Object.hasOwn(parcoursOptions, this.id)) return;
            updateChart(currentParcours === this.id ? null : this.id);
        });
    });

    // Créer l'élément d'affichage du parcours sélectionné
    const chartContainer = document.querySelector('.chart-container');
    const displayDiv = document.createElement('div');
    displayDiv.id = 'current-parcours-display';
    displayDiv.style.marginTop = '20px';
    displayDiv.style.padding = '15px';
    displayDiv.style.background = 'rgba(212, 165, 116, 0.1)';
    displayDiv.style.borderRadius = '6px';
    displayDiv.style.textAlign = 'center';
    displayDiv.style.fontSize = '0.95rem';
    displayDiv.style.display = 'none';
    chartContainer.appendChild(displayDiv);

    // Initialiser l'affichage
    updateStatsDisplay(null);
    
    // Gestion des liens de connaissances
    const knowledgeLinks = document.querySelectorAll('.knowledge-link');
    knowledgeLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Scroll vers l'élément
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Flasher l'élément pour attirer l'attention
                targetElement.style.transition = 'all 0.3s ease';
                targetElement.style.backgroundColor = 'rgba(218, 165, 32, 0.2)';
                
                setTimeout(() => {
                    targetElement.style.backgroundColor = '';
                }, 1500);
            }
        });
    });
});


/* Termion — navigation des classes classiques V2 (progressive enhancement, isolé) */
(() => {
  'use strict';
  const start = () => {
    const nav = document.querySelector('body.termion-classic-v2 .tv-nav');
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
    const entries = links.map(link => {
      const id = link.getAttribute('href').slice(1);
      return {link,section:document.getElementById(id)};
    }).filter(item => item.section);
    const activate = target => {
      entries.forEach(({link,section}) => {
        if (section===target) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    };
    if (typeof IntersectionObserver === 'function') {
      const observer = new IntersectionObserver(records => {
        const visible=records.filter(r=>r.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
        if (visible.length) activate(visible[0].target);
      },{rootMargin:'-15% 0px -70% 0px',threshold:0});
      entries.forEach(({section})=>observer.observe(section));
    }
    links.forEach(link=>link.addEventListener('click',event=>{
      const id=link.getAttribute('href').slice(1),target=document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const top=target.getBoundingClientRect().top+window.scrollY-nav.getBoundingClientRect().height-22;
      window.scrollTo({top:Math.max(0,top),behavior:reduced?'instant':'smooth'});
      if (history.replaceState) history.replaceState(null,'','#'+encodeURIComponent(id));
      activate(target);
    }));
    if(entries.length) activate(entries[0].section);
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
