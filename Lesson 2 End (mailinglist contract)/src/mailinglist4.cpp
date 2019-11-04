#include <mailinglist4.hpp>

ACTION mailinglist4::regusr(name username) {
  // get user's auth
  require_auth(username);
  // see if user is already in table
  add_user(username);
  // add user to table if they are not
}

ACTION mailinglist4::unregusr(name username) {
  // get user's auth
  require_auth(username);
  // see if user is already in table
  delete_user(username);
  // add user to table if they are
}

void mailinglist4::add_user(name username) {
  auto itr = _mailinglist.find(username.value);
  eosio::check ((itr == _mailinglist.end()),"You are already registered!");
  itr = _mailinglist.emplace(username, [&](auto& new_user) {
    new_user.username = username;
  });
}

void mailinglist4::delete_user(name username) {
  auto itr = _mailinglist.find(username.value);
  eosio::check (!(itr == _mailinglist.end()),"You are not in the mailing list!");
  itr = _mailinglist.erase(itr);
} 

EOSIO_DISPATCH(mailinglist4, (regusr)(unregusr))
