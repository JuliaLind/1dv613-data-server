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
   * @returns {Promise<object>} - The user document from database.
   */
  async findOne (id) {
    const user = await UserModel.findOne({
      userId: id
    })

    if (!user) {
      throw createError(404, 'No user data registered')
    }
    return user
  }

  /**
   * Creates a history entry for the user,
   * that contains current weight and date.
   *
   * @param {number} currentWeight - The current weight of the user.
   * @returns {object} - The history entry object.
   */
  #historyEntry (currentWeight) {
    return {
      effectiveDate: new Date(),
      currentWeight
    }
  }

  /**
   * Creates a new user data document in the database.
   *
   * @param {object} userData - associative array of user data
   * @param {string} userId - The userId of the user to update.
   * @returns {Promise<string>} - The mongo database id of the new user document.
   */
  async create (userData, userId) {
    const {
      height,
      currentWeight,
      targetWeight,
      weeklyChange,
      activityLevel,
      gender
    } = userData

    const user = new UserModel({
      userId,
      height,
      gender,
      currentWeight,
      targetWeight,
      weeklyChange,
      activityLevel,
      history: [this.#historyEntry(currentWeight)]
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
      doc.history.push(this.#historyEntry(newData.currentWeight))

      await doc.save()
    }
  }

  /**
   * Deletes the user data document from the database.
   *
   * @param {object} doc - The user document to delete.
   */
  async delete (doc) {
    await doc.deleteOne()
  }
}
