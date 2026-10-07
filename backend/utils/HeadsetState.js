/**
 * IFN636 Assessment 2
 * OOP Principle: Encapsulation - The logic to change status is encapsulated inside the State classes.
 * Design Pattern: State Pattern - Different states (Available, Maintenance, Retired) handle transitions differently.
 */

class State {
    constructor(context) {
        this.context = context;
    }
    getName() { return 'Unknown'; }
    handleStatusChange(newStatus) {
        throw new Error("Invalid status transition.");
    }
}

class AvailableState extends State {
    getName() { return 'Available'; }
    handleStatusChange(newStatus) {
        if (newStatus === 'Maintenance') {
            if (this.context.activeLoan) {
                throw new Error("Cannot set to Maintenance while the headset is actively on loan.");
            }
            this.context.setState(new MaintenanceState(this.context));
        } else if (newStatus === 'Retired') {
            this.context.setState(new RetiredState(this.context));
        } else if (newStatus === 'Available') {
            // Do nothing
        } else {
            throw new Error(`Cannot transition from Available to ${newStatus}`);
        }
    }
}

class MaintenanceState extends State {
    getName() { return 'Maintenance'; }
    handleStatusChange(newStatus) {
        if (newStatus === 'Available') {
            this.context.setState(new AvailableState(this.context));
        } else if (newStatus === 'Retired') {
            this.context.setState(new RetiredState(this.context));
        } else if (newStatus === 'Maintenance') {
            // Do nothing
        } else {
            throw new Error(`Cannot transition from Maintenance to ${newStatus}`);
        }
    }
}

class RetiredState extends State {
    getName() { return 'Retired'; }
    handleStatusChange(newStatus) {
        throw new Error("Retired headset status cannot be changed.");
    }
}

class HeadsetContext {
    constructor(headset, activeLoan) {
        this.headset = headset;
        this.activeLoan = activeLoan;
        
        switch (headset.status) {
            case 'Available': this.state = new AvailableState(this); break;
            case 'Maintenance': this.state = new MaintenanceState(this); break;
            case 'Retired': this.state = new RetiredState(this); break;
            default: this.state = new AvailableState(this);
        }
    }

    setState(state) {
        this.state = state;
        this.headset.status = state.getName();
    }

    requestStatusChange(newStatus) {
        this.state.handleStatusChange(newStatus);
    }
}

module.exports = { HeadsetContext, AvailableState, MaintenanceState, RetiredState };
