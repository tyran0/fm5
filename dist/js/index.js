import PrettyNumber from "./helpers.js";
import { assert, isButton, keyToMethod } from "./helpers.js";

if (document.readyState === 'interactive') {
    const project = new Project(document.querySelector('#project'));

    project.addButtonHandler('#projectInfo');
    project.addButtonHandler('#projectDesc');

    project.addProgressHandler('#projectStats');
    project.updateProgress();

    const rewardSelectionModal = document.querySelector('#rewardSelectionModal');
    project.addModalHandler('selectReward', new ModalHandler(rewardSelectionModal));
}

function Project(node) {
    assert(node, Element);
    this.node = node;
    this.statistics = {};

    this.bookmark = function(pressedButton) {
        console.log('Boomarked this project!', pressedButton);
    }

    this.updateProgress = function() {
        const pNum = new PrettyNumber();
        const value = pNum.unprettify(
            this.statistics.getBackingCurrent());
        const maxValue = pNum.unprettify( 
            this.statistics.getBackingTotal());

        const percentage = (value * 100) / maxValue;
        this.statistics.setProgress(percentage);
    }

    this.addProgressHandler = function(selector) {
        const node = this.node.querySelector(selector);
        const valueHolders =  node.querySelectorAll('[data-value]');

        Array.from(valueHolders).forEach(node => {
            const attr = (node.tagName === 'PROGRESS')
                ? 'value' : 'innerText';
            const key = node.dataset.value;
            const methodName = keyToMethod(key);

            this.statistics['get' + methodName] = () => node[attr];
            this.statistics['set' + methodName] = value => node[attr] = value;
        });
    }

    this.addModalHandler = function(name, handler) {
        this[name] = handler.handler;
    }

    this.addButtonHandler = function(selector) {
        const node = this.node.querySelector(selector);
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