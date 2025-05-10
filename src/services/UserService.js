import createError from 'http-errors'
import { UserModel } from '../models/User.js'

/**
 * Service for managing users.
 */
export class UserService {
  /**
   * Finds a user by id.
   *
   * @param {string} id - The userId of the user to find.
   */
  async findOne (id) {
    const user = await UserModel.findOne({
      userId: id
    })

    if (!user) {
      throw createError(404, 'No user data registered')
    }
  }

  /**
   * Creates a new user data document in the database.
   *
   * @param {object} userData - associative array of user data
   * @param {string} userId - The userId of the user to update.
   * @returns {string} - The mongo database id of the new user document.
   */
  async create (userData, userId) {
    const {
      height,
      currentWeight,
      targetWeight,
      weeklyChange,
      activityLevel
    } = userData

    const user = new UserModel({
      userId,
      height,
      currentWeight,
      targetWeight,
      weeklyChange,
      activityLevel
    })

    user.history.push({
      effectiveDate: new Date(),
      currentWeight
    })
    await user.save()

    return user._id.toString()
  }

  /**
   * Updates the user data document in the database.
   *
   * @param {object} doc - The user document to update.
   * @param {object} newData - The new data to update the user document with.
   */
  async upd (doc, newData) {
    doc.set(newData)
    if (doc.isModified()) {
      doc.history.push({
        effectiveDate: new Date(),
        currentWeight: doc.currentWeight
      })

      await doc.save()
    }
  }
}
