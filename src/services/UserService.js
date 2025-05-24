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
      history: [
        this.#getHistoryEntry(userData)
      ]
    })

    await user.save()

    return user._id.toString()
  }

  /**
   * Checks if the new user data has the latest effective date.
   *
   * @param {object} newData - the new user data to check
   * @param {object} doc  - mongoose document of the user
   * @returns {boolean} - true if the new data is the latest or same as the most recent entry in the history
   */
  #isLatest (newData, doc) {
    return new Date(newData.effectiveDate) >= new Date(doc.toObject().history[0].effectiveDate)
  }

  /**
   * Checks if there is an existing entry ith the same effective date.
   *
   * @param {object} newData - the new user data to check
   * @param {object} doc  - mongoose document of the user
   * @returns {boolean} - true if there already is a history entry with the same effective date
   */
  #entryExists (newData, doc) {
    return doc.history.some(entry => entry.effectiveDate === newData.effectiveDate)
  }

  /**
   * Puts together a new history entry from the new data.
   *
   * @param {object} newData - the new user data to create a history entry from
   * @returns {object} - the history entry object to be stored in the database
   */
  #getHistoryEntry (newData) {
    const {
      effectiveDate,
      currentWeight,
      age,
      height
    } = newData

    return {
      effectiveDate,
      currentWeight,
      age,
      height
    }
  }

  /**
   * Updates the user data document in the database.
   *
   * @param {object} doc - The user document to update.
   * @param {object} newData - The new data to update the user document with.
   */
  async upd (doc, newData) {
    if (!this.#isLatest(newData, doc)) {
      throw createError(400, 'Cannot update user history')
    }

    doc.set(newData)

    const historyEntry = this.#getHistoryEntry(newData)

    if (this.#entryExists(newData, doc)) {
      // replace existing entry if the effective date is the same
      doc.history[0] = historyEntry
    } else {
      doc.history.unshift(historyEntry)
    }

    if (doc.isModified()) {
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
