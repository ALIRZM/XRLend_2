const { expect } = require('chai');
const {
    ValidationRule,
    RequiredRule,
    MinLengthRule,
    MatchRule,
    Validator,
    passwordChangeValidator,
} = require('../utils/validation');

// XRH-50
describe('XRH-50 Validation rules (Strategy pattern)', () => {
    it('should make every rule a child of ValidationRule (inheritance)', () => {
        expect(new RequiredRule('name', 'x')).to.be.instanceOf(ValidationRule);
        expect(new MinLengthRule('name', 3, 'x')).to.be.instanceOf(ValidationRule);
        expect(new MatchRule('a', 'b', 'x')).to.be.instanceOf(ValidationRule);
    });

    it('should throw if a rule does not write its own check()', () => {
        const rule = new ValidationRule('name', 'x');
        expect(() => rule.check('value', {})).to.throw('check() must be written in the child class');
    });

    it('RequiredRule should fail for a missing value or only spaces', () => {
        const rule = new RequiredRule('name', 'Name is needed');
        expect(rule.check(undefined)).to.be.false;
        expect(rule.check('   ')).to.be.false;
        expect(rule.check('Ali')).to.be.true;
    });

    it('MinLengthRule should fail when the value is too short', () => {
        const rule = new MinLengthRule('newPassword', 8, 'Too short');
        expect(rule.check('1234567')).to.be.false;
        expect(rule.check('12345678')).to.be.true;
    });

    it('MatchRule should fail when the two fields are different', () => {
        const rule = new MatchRule('confirmPassword', 'newPassword', 'No match');
        expect(rule.check('abc', { newPassword: 'abd' })).to.be.false;
        expect(rule.check('abc', { newPassword: 'abc' })).to.be.true;
    });

    it('Validator should run any list of rules the same way (polymorphism)', () => {
        const validator = new Validator([
            new RequiredRule('name', 'Name is needed'),
            new MinLengthRule('code', 4, 'Code is too short'),
        ]);

        expect(validator.validate({ name: '', code: 'ab' })).to.deep.equal({
            name: 'Name is needed',
            code: 'Code is too short',
        });
        expect(validator.validate({ name: 'Ali', code: 'abcd' })).to.deep.equal({});
    });

    it('Validator should keep only the first problem for a field', () => {
        const errors = passwordChangeValidator.validate({ currentPassword: 'old', newPassword: '', confirmPassword: '' });
        expect(errors.newPassword).to.equal('Enter a new password');
    });

    it('passwordChangeValidator should pass a correct change password request', () => {
        const errors = passwordChangeValidator.validate({
            currentPassword: 'password123',
            newPassword: 'newpassword456',
            confirmPassword: 'newpassword456',
        });
        expect(errors).to.deep.equal({});
    });
});