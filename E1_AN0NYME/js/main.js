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
                <img src="${project.image}" alt="Aperçu du projet ${project.title}" loading="lazy">
                <div class="card-body">
                    <span class="categorie">${project.category}</span>
                    <h3>${project.title}</h3>
                    <p class="client">Client : ${project.client}</p>
                    <div class="badges">${badges}</div>
                    <button type="button" class="btn btn-details-projet" data-id="${project.id}">Voir détails</button>
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
            boutonInscription = `<button type="button" class="btn btn-inscrire" disabled>S'inscrire</button>`;
        }

        // construction du HTML de la carte
        // data-id garde l'id de la formation, pour savoir laquelle ouvrir dans le modal
        const card = `
            <article class="card">
                <img src="${course.image}" alt="Illustration de la formation ${course.title}" loading="lazy">
                <div class="card-body">
                    <span class="categorie">${course.category}</span> ${statut}
                    <h3>${course.title}</h3>
                    <p class="infos">
                        <span class="niveau">${course.level}</span>
                        ${course.duration} - <strong>${course.price} €</strong>
                    </p>
                    <p class="infos">★ ${course.rating} - ${course.students} étudiants</p>
                    <div class="badges">${badges}</div>
                    <button type="button" class="btn btn-details-formation" data-id="${course.id}">Voir détails</button>
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
        bouton = `<button type="button" class="btn" disabled>Formation complète</button>`;
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

// remplir le select des formations depuis l'api 2
async function loadFormCourses() {
    const $select = $('#formation');
    $select.prop('disabled', true);
    $select.find('option').first().text('Chargement des formations...');

    try {
        const response = await fetch(API_COURSES);
        if (!response.ok) {
            throw new Error('Erreur HTTP ' + response.status);
        }

        const data = await response.json();
        courses = data.courses;

        courses.forEach(course => {
            // les formations complètes sont visibles mais on ne peut pas les choisir
            if (course.available) {
                $select.append(`<option value="${course.id}">${course.title}</option>`);
            } else {
                $select.append(`<option value="${course.id}" disabled>${course.title} (complet)</option>`);
            }
        });

        $select.find('option').first().text('Choisir une formation');
        $select.prop('disabled', false);

        // si on vient du bouton "S'inscrire" d'une carte, l'url contient ?formation=id
        // on sélectionne directement cette formation dans la liste
        const params = new URLSearchParams(window.location.search);
        const idFormation = params.get('formation');

        if (idFormation) {
            const $option = $select.find(`option[value="${idFormation}"]`);
            if ($option.length && !$option.prop('disabled')) {
                $select.val(idFormation);
                validateField('formation');
            }
        }

    } catch (error) {
        console.error('Erreur API formations :', error);
        $select.find('option').first().text('Formations indisponibles');
        $('#erreur-formation').text('Impossible de charger la liste des formations. Veuillez réessayer plus tard.');
    }
}

// regex demandée dans le sujet
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// format international : un + puis entre 8 et 15 chiffres (ex : +33612345678)
const regexTelephone = /^\+[1-9]\d{7,14}$/;

// règles de validation pour chaque champ obligatoire
// chaque fonction renvoie le message d'erreur, ou '' si c'est bon
const rules = {
    prenom: value => value.length >= 2 ? '' : 'Le prénom doit contenir au moins 2 caractères.',
    nom: value => value.length >= 2 ? '' : 'Le nom doit contenir au moins 2 caractères.',
    email: value => {
        if (value === '') return "L'email est obligatoire.";
        return regexEmail.test(value) ? '' : "L'email n'est pas valide (ex : nom@domaine.com).";
    },
    telephone: value => {
        if (value === '') return 'Le téléphone est obligatoire.';
        // on enlève les espaces, points et tirets avant de tester
        const numero = value.replace(/[\s.-]/g, '');
        return regexTelephone.test(numero) ? '' : 'Format international attendu (ex : +33 6 12 34 56 78).';
    },
    formation: value => value !== '' ? '' : 'Veuillez choisir une formation.',
    niveau: value => value !== '' ? '' : 'Veuillez choisir votre niveau.',
    motivation: value => value.length >= 50 ? '' : `La motivation doit contenir au moins 50 caractères (${value.length}/50).`
};

// vérifie un champ et affiche l'erreur en dessous
// renvoie true si le champ est valide
function validateField(id) {
    const $field = $('#' + id);
    const value = $field.val().trim();
    const message = rules[id](value);

    $('#erreur-' + id).text(message);

    if (message === '') {
        $field.removeClass('erreur').addClass('valide').attr('aria-invalid', 'false');
        return true;
    } else {
        $field.removeClass('valide').addClass('erreur').attr('aria-invalid', 'true');
        return false;
    }
}

// compteur de caractères de la motivation
function updateCounter() {
    const nb = $('#motivation').val().trim().length;
    $('#compteur').text(nb + ' / 50 caractères');

    if (nb >= 50) {
        $('#compteur').addClass('ok');
    } else {
        $('#compteur').removeClass('ok');
    }
}

// vider le formulaire et enlever les couleurs / messages
function resetForm() {
    $('#form-inscription')[0].reset();
    $('#form-inscription .erreur, #form-inscription .valide')
        .removeClass('erreur valide')
        .removeAttr('aria-invalid');
    $('.message-erreur').text('');
    updateCounter();
}

// envoi du formulaire
function submitForm(e) {
    // empêche la page de se recharger
    e.preventDefault();

    // on valide tous les champs d'un coup
    // map() renvoie un tableau de true/false, every() vérifie qu'il n'y a que des true
    const results = Object.keys(rules).map(id => validateField(id));
    const formOk = results.every(ok => ok);

    if (!formOk) {
        // on met le curseur sur le 1er champ en erreur
        $('#form-inscription .erreur').first().focus();
        return;
    }

    const prenom = $('#prenom').val().trim();
    const formation = $('#formation option:selected').text();

    openModal(`
        <h2>Inscription envoyée !</h2>
        <p>Merci ${prenom}, votre demande d'inscription à la formation <strong>${formation}</strong> a bien été enregistrée.</p>
        <p>Vous allez recevoir un email de confirmation.</p>
        <button type="button" class="btn" id="btn-ok">OK</button>
    `);

    resetForm();
}

// jQuery attend que la page soit chargée avant de lancer le code
$(function () {
    // fermeture du modal (il y en a un sur les 2 pages)
    // avec la croix
    $('.modal-close').on('click', closeModal);

    // en cliquant à côté (sur le fond gris, pas dans la fenêtre)
    $('#modal').on('click', function (e) {
        if (e.target === this) {
            closeModal();
        }
    });

    // avec Echap
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && $('#modal').is(':visible')) {
            closeModal();
        }
    });

    // navigation clavier : quand le modal est ouvert, Tab reste dans le modal
    // arrivé au dernier élément on revient au premier (et l'inverse avec Shift+Tab)
    $('#modal').on('keydown', function (e) {
        if (e.key !== 'Tab') return;

        const $focusables = $(this).find('a, button:not([disabled])');
        const first = $focusables.first()[0];
        const last = $focusables.last()[0];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });

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
    }

    // page inscription
    if ($('#form-inscription').length) {
        loadFormCourses();

        // Object.keys(rules) = ['prenom', 'nom', 'email', ...]
        Object.keys(rules).forEach(id => {
            const $field = $('#' + id);

            // validation en temps réel pendant la saisie
            // (seulement si le champ a déjà été touché, pour pas afficher d'erreur dès la 1ere lettre)
            $field.on('input', function () {
                if ($field.hasClass('erreur') || $field.hasClass('valide')) {
                    validateField(id);
                }
            });

            // quand on quitte le champ ou qu'on change un select
            $field.on('blur change', function () {
                validateField(id);
            });
        });

        $('#motivation').on('input', updateCounter);

        $('#form-inscription').on('submit', submitForm);

        // bouton OK du message de succès (créé dans le modal donc délégation)
        $('#modal').on('click', '#btn-ok', closeModal);
    }
});