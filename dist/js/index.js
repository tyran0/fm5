import { numberFunctions, DataHandler } from "./helpers.js";
import { findNode, getExactChild } from "./helpers.js";

const env = {
    backersAlreadySet: false,
    backingGoalReached: false
}

if (document.readyState === 'interactive') {
    const project = new Project(document.querySelector('#project'));

    const projectInfo = document.querySelector('#projectInfo');
    project.addButtonHandler(projectInfo);

    const projectDesc = document.querySelector('#projectDesc');
    project.addButtonHandler(projectDesc);

    const projectStats = document.querySelector('#projectStats');
    const projectStatsHandler = new DataHandler(projectStats);
    projectStatsHandler.addMethod('updateBackingProgress', e => {
        const num_f = numberFunctions;
        const value = num_f.unprettify(e.getBackingCurrent());
        const maxValue = num_f.unprettify(e.getBackingTotal());
        const percentage = (value * 100) / maxValue;
        e.setProgress(percentage);
    });

    projectStats.updateBackingProgress();

    const confirmationModal = document.querySelector('#confirmationModal');
    const rewardSelectionModal = document.querySelector('#rewardSelectionModal');
    project.registerAction('confirm', new ModalHandler(confirmationModal));
    project.registerAction('selectReward', new ModalHandler(rewardSelectionModal));
    project.registerAction('bookmark', {
        handler: button => {
            const label = button.querySelector('.button_label');
            const state = button.classList.toggle('button-accent');
            label.innerText = state ? 'Bookmarked!' : 'Bookmark';
        }
    });

    const pledgeForm = document.querySelector('#pledgeForm');
    const pledgeFormItems = pledgeForm.querySelectorAll('.pledgeForm_item');
    const pledgeFormHandler = new DataHandler(...pledgeFormItems);

    const pledgeFormFunctions = {
        updateInputs: () => {
            const hiddenFields = pledgeForm
                .querySelectorAll('fieldset:not([hidden])');
            if (hiddenFields.length > 0) hiddenFields
                .forEach(elem => elem.hidden = true);

            const disabledFields = pledgeForm
                .querySelectorAll('fieldset:not([disabled])');
            if (disabledFields.length > 0) disabledFields
                .forEach(elem => elem.disabled = true);
        },
        toggleItem: item => {
            pledgeFormFunctions.updateInputs();
            const fieldset = item
                .querySelector('fieldset');
            fieldset.hidden = false;
            fieldset.disabled = false;
        },
        updateOnSubmit: item => {
            const num_f = numberFunctions;
            const fieldset = item.querySelector('fieldset');
            const fieldsetInputs = Array.from(
                fieldset.querySelectorAll('input'));

            const pledgeAmountInput = fieldsetInputs.filter(
                elem => elem.name === 'pledge_amount')[0];
            const pledgeAmount =  !pledgeAmountInput ? null
                : Number(pledgeAmountInput.value);

            if (pledgeAmount) {
                const backingTotal = num_f.unprettify(
                    projectStats.getBackingTotal());
                const backingSum = num_f.unprettify(
                    projectStats.getBackingCurrent());
                const backingSumTest = backingSum + pledgeAmount;
                const updatedBackingSum = num_f.prettify(backingSumTest);

                if (backingSumTest > backingTotal) {
                    rewardSelectionModal.click();
                    return;
                }
                
                projectStats.setBackingCurrent(updatedBackingSum);
                projectStats.updateBackingProgress();
            }
            
            if (!env.backersAlreadySet) {
                const backers = num_f.unprettify(
                    projectStats.getBackers());
                    const updatedBackers = num_f.prettify(backers + 1);
                projectStats.setBackers(updatedBackers);
            }
            
            if (item.getRewardsLeft && item.setRewardsLeft) {
                const rewardsLeft = num_f.unprettify(item.getRewardsLeft());
                const updatedRewardsLeft = num_f.prettify(rewardsLeft - 1);
                if (updatedRewardsLeft > 0) item.setRewardsLeft(updatedRewardsLeft);
            }
            
            const toggledRadioButtons = pledgeForm
            .querySelectorAll(`input[type='radio']:checked`);
            if (toggledRadioButtons.length > 0) toggledRadioButtons
            .forEach(elem => elem.checked = false);
            
            env.backersAlreadySet = true;
            project.actions.confirm();
            pledgeFormFunctions.updateInputs();
        }
    }
    
    pledgeForm.addEventListener('submit', e => {
        e.preventDefault();
        const button = e.submitter;
        const item = getExactChild(button, pledgeFormItems)[0];
        pledgeFormFunctions.updateOnSubmit(item);
        rewardSelectionModal.close();
    });

    pledgeForm.addEventListener('click', e => {
        const target = e.target;

        const input = (target.nodeName === 'INPUT')
            ? target : undefined;

        if (input && input.type === 'radio') {
            const item = getExactChild(input, pledgeFormItems)[0];
            pledgeFormFunctions.toggleItem(item);
        }
    });
}

function Project(node) {
    this.root = node;
    this.actions = {};

    this.registerAction = function (name, handler) {
        this.actions[name] = handler.handler.bind(this);
    }

    this.addButtonHandler = function (node) {
        node.addEventListener('click', e => {
            const target = e.target;

            const button = findNode(target, e => {
                return e.nodeName === 'BUTTON'
            }, node);
            
            if (button) {
                const action = button.dataset.action;
                if (action) this.actions[action](button);
            }
        });
    }
}

function ModalHandler(node) {
    const bodyStyle = document.body.style;

    node.addEventListener('click', e => {
        const target = e.target;
        const button = (target.nodeName === 'BUTTON')
            ? target : null;

        const action = target.dataset.action;
        const flag = button && action === 'closeModal'
        if (e.target === node || flag) {
            bodyStyle.overflow = 'initial';
            node.close();
        }
    });

    this.handler = function () {
        bodyStyle.overflow = 'hidden';
        node.showModal();
    }
}