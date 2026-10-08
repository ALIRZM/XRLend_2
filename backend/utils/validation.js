/**
 * IFN636 Assessment 2 - Profile Management (Ali)
 */
class ValidationRule {
    constructor(field , message) {
        this.field= field;
        this.message =message;
    }


    check(value , body) {
        throw new Error('check() must be written in the child class');
    }
}


class RequiredRule extends ValidationRule {
    check( value) {
        return typeof value === 'string' && value.trim().length > 0;
    }
}

// at least a set number of characters
class MinLengthRule extends ValidationRule {
    constructor(field, min, message) {
        super(field, message);
        this.min= min;
    }

    check(value) {
        return typeof value === 'string' && value.length >= this.min;
    }
}

// repeat new password
class MatchRule extends ValidationRule {
    constructor(field, otherField, message) {
        super(field, message);
        this.otherField= otherField;
    }

    check(value, body) {
        return value === body[this.otherField];
    }
}


class Validator {
    constructor(rules) {
        this.rules = rules;
    }


    validate(body = {}) {
        const errors = {};
        for (const rule of this.rules) {
            
            if (errors[rule.field]) continue;
            if (!rule.check(body[rule.field], body)) {
                errors[rule.field] = rule.message;
            }
        }
        return errors;
    }
}

// rules
const passwordChangeValidator=new Validator([
    new RequiredRule('currentPassword' , 'Enter your old password'),
    new RequiredRule('newPassword' , 'Enter a new password'),
    new MinLengthRule('newPassword', 8 , 'The new password must be at least 8 characters'),
    new MatchRule('confirmPassword' , 'newPassword' , 'The two new passwords are not the same'),
]);

module.exports= {
    ValidationRule,
    RequiredRule,
    MinLengthRule,
    MatchRule,
    Validator,
    passwordChangeValidator,
};