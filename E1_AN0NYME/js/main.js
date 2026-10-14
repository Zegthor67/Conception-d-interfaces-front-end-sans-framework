// URL
const API_PROJECTS = 'https://webcraft-api.vercel.app/data/projects.json';
const API_COURSES = 'https://webcraft-api.vercel.app/data/courses.json';

// tableau des projets (rempli après le fetch)
let projects = [];

// charger les projets
async function loadProjects() {
    $('#projects-loader').show();
    $('#projects-error').hide();

    try {
        const response = await fetch(API_PROJECTS);
        if (!response.ok) {
            throw new Error('Erreur HTTP ' + response.status);
        }

        const data = await response.json();
        projects = data.projects;
        displayProjects(projects);

    } catch (error) {
        // l'api ne marche pas
        console.error('Erreur API projets :', error);
        $('#projects-error')
            .text('Impossible de charger les projets pour le moment. Veuillez réessayer plus tard.')
            .show();

    } finally {
        // on cache le loader dans tous les cas
        $('#projects-loader').hide();
    }
}

// afficher les projets
function displayProjects(list) {
    const $container = $('#projects-list');
    $container.empty();

    if (list.length === 0) {
        $container.html('<p class="aucun-resultat">Aucun projet trouvé.</p>');
        return;
    }

    list.forEach(project => {
        const badges = project.technologies
            .map(tech => `<span class="badge">${tech}</span>`)
            .join('');

        const card = `
            <article class="card">
                <img src="${project.image}" alt="Aperçu du projet ${project.title}">
                <div class="card-body">
                    <span class="categorie">${project.category}</span>
                    <h3>${project.title}</h3>
                    <p class="client">Client : ${project.client}</p>
                    <div class="badges">${badges}</div>
                    <button class="btn btn-details" data-id="${project.id}">Voir détails</button>
                </div>
            </article>
        `;

        $container.append(card);
    });
}

// fonction qui s'exécute une fois le DOM chargé
$(function () {
    if ($('#projects-list').length) {
        loadProjects();
    }
});
