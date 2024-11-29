const bcrypt =  require("bcrypt")

export const hashPassword =  function (plainText, saltRounds) {
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(plainText,salt);
}

export const comparePassword =  function (plainText,hashedPassword) {
    return bcrypt.compareSync(plainText,hashedPassword)
}