import { assert, isButton } from "./helpers.js";

if (document.readyState === 'interactive') {
    const project = new Project(document.querySelector('#project'));

    project.addButtonHandler('#projectInfo');
    project.addButtonHandler('#projectDesc');

    const rewardSelectionModal = document.querySelector('#rewardSelectionModal');
    project.addModalHandler('selectReward', new ModalHandler(rewardSelectionModal));
}

function Project(node) {
    assert(node, Element);
    this.node = node;
    this.stats = node
        .querySelector('#projectStats');

    this.bookmark = function(pressedButton) {
        console.log('Boomarked this project!', pressedButton);
    }

    this.addModalHandler = function(name, handler) {
        this[name] = handler.handler;
    }

    this.addButtonHandler = function(selector) {
        const node = document.querySelector(selector);
        node.addEventListener('click', e => {
            const target = e.target;
            const button = isButton(target);
            
            if (button) {
                const action = button.dataset.action;
                if (action) this[action](button);
            }
        });
    }
}

function ModalHandler(modal, callback) {
    const body = document.body.style;

    assert(callback, 'function');
    this.handler = () => {
        body.overflow = 'hidden';
        modal.showModal();
        callback ? callback(modal)
            : undefined;
    }

    modal.addEventListener('click', e => {
        if (e.target === modal) {
            body.overflow = 'initial';
            modal.close();
        }
    });
}