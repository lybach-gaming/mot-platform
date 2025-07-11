export interface IUserBadge {
  id: number;
  user_id: number;
  dashing_debut: boolean;
  dashing_debut_counter: number;
  combat_winner: boolean;
  combat_winner_counter: number;
  clash_winner: boolean;
  clash_winner_counter: number;
  most_wanted_winner: boolean;
  most_wanted_winner_counter: number;
  ultimate_player: boolean;
  quiz_warrior: boolean;
  quiz_warrior_counter: number;
  super_sonic: boolean;
  flashback: boolean;
  brainiac: boolean;
  big_thing: boolean;
  elite: boolean;
  thirsty: boolean;
  thirsty_date: string | null;
  thirsty_counter: number;
  power_elite: boolean;
  power_elite_counter: number;
  sharing_caring: boolean;
  streak: boolean;
  streak_date: string | null;
  streak_counter: number;
}
