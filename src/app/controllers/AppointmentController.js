import * as Yup from "yup";
import { startOfHour, parseISO, isBefore } from "date-fns";
import User from "../models/User";
import File from "../models/File";
import Appointment from "../models/Appointment";

class AppointmentController {

  async index(req, res){
    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include:[
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url']
            }
          ]
        }
      ]
    })

    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validadion fails" });
    }

    const { provider_id, date } = req.body;

    /**
     * Checando se provider_id é um provider
     */
    const checkIsProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!checkIsProvider) {
      return res
        .status(401)
        .json({ error: "You can only create appointments with providers." });
    }

    const hourStart = startOfHour(parseISO(date));

    /**
     * Se a data que estou usando é antes da data atual, então retorno erro
     */
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: "Past dates are not permitted." });
    }

    /**
     * Checar se a data está disponível
     */
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: "Appointment date is not available." });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
