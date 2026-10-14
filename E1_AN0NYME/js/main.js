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

        // on remplit les select des filtres avec les listes de l'api
        fillSelect('#projects-tech', data.technologies);
        fillSelect('#projects-category', data.categories);

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
                    <button class="btn btn-details-projet" data-id="${project.id}">Voir détails</button>
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

        fillSelect('#courses-category', data.categories);
        fillSelect('#courses-level', data.levels);
        fillSelect('#courses-tech', data.technologies);

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
                    <p class="infos">★ ${course.rating} -${course.students} étudiants</p>
                    <div class="badges">${badges}</div>
                    <!-- data-id garde l'id de la formation, pour savoir laquelle ouvrir dans le modal -->
                    <button class="btn btn-details-formation" data-id="${course.id}">Voir détails</button>
                    ${boutonInscription}
                </div>
            </article>
        `;
        $container.append(card);
    });
}

// ajoute une option dans un select pour chaque valeur du tableau
function fillSelect(selector, values) {
    values.forEach(value => {
        $(selector).append(`<option value="${value}">${value}</option>`);
    });
}

// filtrer les projets (recherche + techno + catégorie en même temps)
function filterProjects() {
    const search = $('#projects-search').val().toLowerCase().trim();
    const tech = $('#projects-tech').val();
    const category = $('#projects-category').val();

    // filter() garde seulement les projets qui passent les 3 conditions
    // si un filtre est vide, on ne le prend pas en compte
    const result = projects.filter(project => {
        const texte = (project.title + ' ' + project.client + ' ' + project.description).toLowerCase();
        const okSearch = texte.includes(search);
        const okTech = tech === '' || project.technologies.includes(tech);
        const okCategory = category === '' || project.category === category;
        return okSearch && okTech && okCategory;
    });
    displayProjects(result);
}

// pareil pour les formations avec le niveau en plus
function filterCourses() {
    const search = $('#courses-search').val().toLowerCase().trim();
    const category = $('#courses-category').val();
    const level = $('#courses-level').val();
    const tech = $('#courses-tech').val();

    const result = courses.filter(course => {
        const texte = (course.title + ' ' + course.instructor + ' ' + course.description).toLowerCase();

        const okSearch = texte.includes(search);
        const okCategory = category === '' || course.category === category;
        const okLevel = level === '' || course.level === level;
        const okTech = tech === '' || course.technologies.includes(tech);

        return okSearch && okCategory && okLevel && okTech;
    });
    displayCourses(result);
}

// attend que l'utilisateur arrête de taper avant de lancer la fonction
// à chaque touche on annule le timer précédent et on en relance un nouveau
// donc la fonction se lance seulement 300ms après la dernière touche
function debounce(fn, delay) {
    let timer;
    return function () {
        clearTimeout(timer);
        timer = setTimeout(fn, delay);
    };
}

// bouton qui a ouvert le modal (pour remettre le focus dessus a la fermeture)
let lastButton = null;

// ouvrir le modal avec le contenu html donné
function openModal(html) {
    lastButton = document.activeElement;
    $('#modal-body').html(html);
    $('#modal').fadeIn(200);
    $('body').addClass('no-scroll');
    $('.modal-close').focus();
}

// fermer le modal
function closeModal() {
    $('#modal').fadeOut(200);
    $('body').removeClass('no-scroll');
    if (lastButton) {
        lastButton.focus();
    }
}

// contenu du modal projet
function showProject(id) {
    // find() renvoie le premier projet qui a cet id
    const project = projects.find(p => p.id === id);
    if (!project) return;

    const badges = project.technologies.map(tech => `<span class="badge">${tech}</span>`).join('');
    const features = project.features.map(f => `<li>${f}</li>`).join('');

    openModal(`
        <img src="${project.image}" alt="Aperçu du projet ${project.title}">
        <span class="categorie">${project.category}</span>
        <h2>${project.title}</h2>
        <p><strong>Client :</strong> ${project.client}</p>
        <p><strong>Année :</strong> ${project.year} - <strong>Durée :</strong> ${project.duration}</p>
        <p>${project.description}</p>
        <h3>Technologies</h3>
        <div class="badges">${badges}</div>
        <h3>Fonctionnalités</h3>
        <ul class="liste">${features}</ul>
        <a href="${project.url}" class="btn" target="_blank" rel="noopener">Voir le site</a>
    `);
}

// contenu du modal formation
function showCourse(id) {
    const course = courses.find(c => c.id === id);
    if (!course) return;

    const badges = course.technologies.map(tech => `<span class="badge">${tech}</span>`).join('');
    const modules = course.modules.map(m => `<li>${m}</li>`).join('');

    let bouton = `<a href="inscription.html?formation=${course.id}" class="btn btn-inscrire">S'inscrire maintenant</a>`;
    if (!course.available) {
        bouton = `<button class="btn" disabled>Formation complète</button>`;
    }

    openModal(`
        <img src="${course.image}" alt="Illustration de la formation ${course.title}">
        <span class="categorie">${course.category}</span>
        <h2>${course.title}</h2>
        <p>
            <span class="niveau">${course.level}</span>
            ${course.duration} - <strong>${course.price} €</strong>
        </p>
        <p>★ ${course.rating} - ${course.students} étudiants</p>
        <p><strong>Formateur :</strong> ${course.instructor}</p>
        <p>${course.description}</p>
        <h3>Technologies</h3>
        <div class="badges">${badges}</div>
        <h3>Modules</h3>
        <ul class="liste">${modules}</ul>
        ${bouton}
    `);
}

// jQuery attend que la page soit chargée avant de lancer le code
$(function () {
    // #projects-list existe seulement sur index.html
    // donc ça évite de lancer les fetch sur la page inscription
    if ($('#projects-list').length) {
        loadProjects();
        loadCourses();

        // recherche en temps réel
        $('#projects-search').on('input', debounce(filterProjects, 300));
        $('#courses-search').on('input', debounce(filterCourses, 300));

        // filtres
        $('#projects-tech, #projects-category').on('change', filterProjects);
        $('#courses-category, #courses-level, #courses-tech').on('change', filterCourses);

        // les cartes sont créées après le chargement de la page
        // donc on met le click sur la div parent (délégation d'événement)
        $('#projects-list').on('click', '.btn-details-projet', function () {
            // data('id') renvoie déjà un nombre avec jQuery
            showProject($(this).data('id'));
        });

        $('#courses-list').on('click', '.btn-details-formation', function () {
            showCourse($(this).data('id'));
        });

        // fermeture avec la croix
        $('.modal-close').on('click', closeModal);

        // fermeture en cliquant à côté (sur le fond gris, pas dans la fenêtre)
        $('#modal').on('click', function (e) {
            if (e.target === this) {
                closeModal();
            }
        });

        // fermeture avec Echap
        $(document).on('keydown', function (e) {
            if (e.key === 'Escape' && $('#modal').is(':visible')) {
                closeModal();
            }
        });
    }
});