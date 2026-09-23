import { useDailyEqubStore } from "../store/dailyEqubStore";
import { useWeeklyEqubStore } from "../store/weeklyEqubStore";
import { useMonthlyEqubStore } from "../store/monthlyEqubStore";
import { useHouseEqubStore } from "../store/houseEqubStore";
import { useVehicleEqubStore } from "../store/vehicleEqubStore";
import { usePhoneEqubStore } from "../store/phoneEqubStore";
import { useJoinedEqubStore } from "../store/joinedEqubStore";
import { useNotificationStore } from "../store/notificationStore";

export function clearAllStores() {
  useDailyEqubStore.setState({ equbs: [], fetching: false, error: null });
  useWeeklyEqubStore.setState({ equbs: [], fetching: false, error: null });
  useMonthlyEqubStore.setState({ equbs: [], fetching: false, error: null });
  useHouseEqubStore.setState({ equbs: [], fetching: false, error: null });
  useVehicleEqubStore.setState({ equbs: [], fetching: false, error: null });
  usePhoneEqubStore.setState({ equbs: [], fetching: false, error: null });
  useJoinedEqubStore.setState({ joinedEqubs: [], fetching: false, hasLoaded: false, error: null });
  useNotificationStore.getState().clearNotifications();
}
