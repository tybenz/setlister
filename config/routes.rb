Setlister::Application.routes.draw do
  devise_for :users

  resources :songs
  resources :setlists
  resources :setlist_songs

  root :to => 'home#index'
end
