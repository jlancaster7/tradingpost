import {ensureServerExtensions} from "."
import Ibkr from "./Ibkr"
import {getHivePool} from "../../../db";


export default ensureServerExtensions<Ibkr>({})