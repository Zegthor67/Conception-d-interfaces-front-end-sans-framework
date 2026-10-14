// URL
const API_PROJECTS = 'https://webcraft-api.vercel.app/data/projects.json';
const API_COURSES = 'https://webcraft-api.vercel.app/data/courses.json';

// tableaux remplis après les fetch
let projects = [];
let courses = [];

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

// fonction pour charger les formations
async function loadCourses() {
    $('#courses-loader').show();   // on affiche le rond qui tourne
    $('#courses-error').hide();    // on cache le message d'erreur au cas où

    try {
        // attente de la réponse, puis recoit les données depuis l'API
        const response = await fetch(API_COURSES);

        // si le serveur répond mal ça déclenche une erreur
        // ça nous envoie direct dans le catch plus bas
        if (!response.ok) {
            throw new Error('Erreur HTTP ' + response.status);
        }

        // on transforme la réponse en JSON
        const data = await response.json();

        // on garde les formations dans la variable du haut du fichier
        courses = data.courses;

        // on les affiche
        displayCourses(courses);

    } catch (error) {
        // ici si ça a planté (pas internet, mauvaise url, erreur serveur...)
        console.error('Erreur API formations :', error);
        $('#courses-error')
            .text('Impossible de charger les formations pour le moment. Veuillez réessayer plus tard.')
            .show();   // affiche message pour l'utilisateur

    } finally {
        // finally passe, que ça marche ou pas
        // donc le loader disparait dans tous les cas
        $('#courses-loader').hide();
    }
}

// fonction pour afficher les formations
// "list" = le tableau de formations à afficher
function displayCourses(list) {
    const $container = $('#courses-list');   // la div où on met les cartes
    $container.empty();                      // on la vide avant de la remplir

    // si le tableau est vide on met un petit message et on s'arrête là
    if (list.length === 0) {
        $container.html('<p class="aucun-resultat">Aucune formation trouvée.</p>');
        return;
    }

    // on passe sur chaque formation une par une
    list.forEach(course => {

        // ex : ["React", "JavaScript"]
        // map  -> ['<span class="badge">React</span>', '<span class="badge">JavaScript</span>']
        // join -> on colle tout en un seul texte
        const badges = course.technologies
            .map(tech => `<span class="badge">${tech}</span>`)
            .join('');

        // par défaut la formation est dispo avec un lien vers l'inscription
        // le ?formation=id dans l'url servira à préremplir le formulaire plus tard
        let statut = '<span class="statut dispo">Disponible</span>';
        let boutonInscription = `<a href="inscription.html?formation=${course.id}" class="btn btn-inscrire">S'inscrire</a>`;

        // si elle est complète on change le badge et on bloque le bouton
        if (!course.available) {
            statut = '<span class="statut complet">Complet</span>';
            boutonInscription = `<button class="btn btn-inscrire" disabled>S'inscrire</button>`;
        }

        // construction du HTML de la carte
        const card = `
            <article class="card">
                <img src="${course.image}" alt="Illustration de la formation ${course.title}">
                <div class="card-body">
                    <span class="categorie">${course.category}</span> ${statut}
                    <h3>${course.title}</h3>
                    <p class="infos">
                        <span class="niveau">${course.level}</span>
                        ${course.duration} - <strong>${course.price} €</strong>
                    </p>
                    <p class="infos">★ ${course.rating} - ${course.students} étudiants</p>
                    <div class="badges">${badges}</div>
                    <!-- data-id garde l'id de la formation, pour savoir laquelle ouvrir dans le modal -->
                    <button class="btn btn-details" data-id="${course.id}">Voir détails</button>
                    ${boutonInscription}
                </div>
            </article>
        `;
        $container.append(card);
    });
}

// jQuery attend que la page soit chargée avant de lancer le code
$(function () {
    // #projects-list existe seulement sur index.html
    // donc ça évite de lancer les fetch sur la page inscription
    if ($('#projects-list').length) {
        loadProjects();
        loadCourses();
    }
});