import crypto from 'crypto'

/**
 * PayU hash generation for payment request
 * Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt)
 */
export function generatePaymentHash({
  key,
  txnid,
  amount,
  productinfo,
  firstname,
  email,
  salt,
  udf1 = '',
  udf2 = '',
  udf3 = '',
  udf4 = '',
  udf5 = '',
}) {
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`
  return crypto.createHash('sha512').update(hashString).digest('hex')
}

/**
 * Verify PayU response hash
 * Formula: sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function verifyResponseHash({
  salt,
  status,
  udf5 = '',
  udf4 = '',
  udf3 = '',
  udf2 = '',
  udf1 = '',
  email,
  firstname,
  productinfo,
  amount,
  txnid,
  key,
  expectedHash,
}) {
  const hashString = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`
  const calculated = crypto.createHash('sha512').update(hashString).digest('hex')
  return calculated === expectedHash
}

/**
 * Generate PayU form params for frontend redirect
 */
export function getPayUFormParams({ txnid, amount, productinfo, firstname, email, phone, udf1 = '', udf2 = '' }) {
  const key = process.env.PAYU_MERCHANT_KEY
  const salt = process.env.PAYU_SALT
  const baseUrl = process.env.PAYU_BASE_URL || 'https://secure.payu.in'

  const hash = generatePaymentHash({
    key,
    txnid,
    amount: amount.toString(),
    productinfo,
    firstname,
    email,
    salt,
    udf1,
    udf2,
  })

  return {
    key,
    txnid,
    amount: amount.toString(),
    productinfo,
    firstname,
    email,
    phone,
    udf1,
    udf2,
    hash,
    furl: `${process.env.API_URL || 'http://localhost:8080'}/api/payments/failure`,
    surl: `${process.env.API_URL || 'http://localhost:8080'}/api/payments/success`,
    action: `${baseUrl}/_payment`,
  }
}