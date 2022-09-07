import React from "react";
import "./HomePageNew.scss";

const Callout = ({ ...props }) => {
  return (
    <div className={`Callout ${props.styleName ? props.styleName : ""}`}>
      <div className="Callout__title">{props.title}</div>
      <div className="Callout__text">{props.text}</div>
      <div className="Callout__text">{props.children}</div>
      <div className="Callout__button">
        <button onClick={() => (window.location.href = "/register")}>
          <div className="button-text">{props.buttonText}</div>
        </button>
      </div>
    </div>
  );
};

const Feature = ({ ...props }) => {
  return (
    <div className="Feature">
      <img src={props.imgSrc} />
      <div className="Feature__valueProp">{props.valuePropA}</div>
      <div className="Feature__valueProp">{props.valuePropB}</div>
      <div className="Feature__explanation">{props.explanation}</div>
    </div>
  );
};

const HomePageNew = () => {
  document.body.style.overflow = "visible";

  return (
    <>
      <div className="HomePageNew__header">
        <img src="https://storage.cloud.google.com/wager-static-assets/site-static/logo.png" />
        <button
          className="HomePageNew__header-register"
          onClick={() => (window.location.href = "/register")}
        >
          <div className="button-text">TRY IT OUT</div>
        </button>
        <div className="HomePageNew__header-signin">
          <a href="/signin">Sign in</a>
        </div>
      </div>
      <div className="HomePageNew">
        <div className="HomePageNew__halfgrid">
          <div className="HomePageNew__left">
            <Callout
              title="Honest, Easy Casino-less Sports Betting"
              text="Bet with people, eliminate 100% of house edge, never watch a game
              alone again"
              buttonText="Limited time free access ⟶"
            />
          </div>
          <div className="HomePageNew__right">
            <div
              data-poster-url="videos/WagerSidebar-poster-00001.jpg"
              data-video-urls="https://storage.googleapis.com/wager-static-assets/site-static/sidebar_people.mp4"
              data-autoplay="true"
              data-loop="true"
              data-wf-ignore="true"
              className="HomePageNew__video"
            >
              <video
                autoPlay={true}
                loop={true}
                muted={true}
                playsInline={true}
                data-wf-ignore="true"
                data-object-fit="cover"
              >
                <source
                  src="https://storage.googleapis.com/wager-static-assets/site-static/sidebar_people.mp4"
                  data-wf-ignore="true"
                />
                <source
                  src="https://storage.googleapis.com/wager-static-assets/site-static/sidebar_people.webm"
                  data-wf-ignore="true"
                />
              </video>
            </div>
          </div>
        </div>

        <div className="HomePageNew__testimonials">
          <div className="HomePageNew__testimonial">
            <div className="HomePageNew__testimonials-left quote">
              “Easy to use, quick access to deposits, withdrawls, not sketch. No
              house!”
              <div className="HomePageNew__testimonials-person">- Henry A.</div>
            </div>
            <div className="HomePageNew__testimonials-right">
              <div className="HomePageNew_-testimonials-image-container">
                <img
                  className="HomePageNew__testimonails-image"
                  src="https://storage.googleapis.com/wager-static-assets/site-static/testimonial_a.jpeg"
                />
              </div>
            </div>
          </div>
          <div className="HomePageNew__testimonial">
            <div className="HomePageNew__testimonials-left quote">
              {`"It's easy for beginners, like me, to use. I have never bet
              before on sports, so using Wager was very easy for me to learn how
              to use and get into."`}{" "}
              <div className="HomePageNew__testimonials-person">
                - Richelle L.
              </div>
            </div>
            <div className="HomePageNew__testimonials-right">
              <div className="HomePageNew_-testimonials-image-container">
                <img
                  className="HomePageNew__testimonails-image"
                  src="https://storage.googleapis.com/wager-static-assets/site-static/testimonial_b.jpeg"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="HomePageNew__halfgrid">
          <Callout
            title="Eliminate the House 100% off fees"
            text="Casino hide fees by charging extra for your bets.
At Wager we eliminate fees. Live 100% Fee Free"
            buttonText="Try premium for free"
          />
          <div className="HomePageNew__screenshot">
            <img src="https://storage.googleapis.com/wager-static-assets/site-static/comparison_services.png" />
          </div>
        </div>

        <div className="HomePageNew__features">
          <Feature
            imgSrc="https://storage.googleapis.com/wager-static-assets/site-static/todo.svg"
            valuePropA="Easy & Fee-less"
            valuePropB="Deposit, Withdrawal"
            explanation="Deposit and Withdrawal easily with Paypal and credit card. We never charge fees on deposits and withdrawals"
          />
          <Feature
            imgSrc="https://storage.googleapis.com/wager-static-assets/site-static/assets.svg"
            valuePropA="Step by Step"
            valuePropB="Easiest way to bet"
            explanation="Deposit and Withdrawal easily with Paypal and credit card. We never charge fees on deposits and withdrawals"
          />
          <Feature
            imgSrc="https://storage.googleapis.com/wager-static-assets/site-static/community.svg"
            valuePropA="Community of Lovers"
            valuePropB=""
            explanation="Pick a team, Pick and amount, Game on!"
          />
        </div>

        <div className="HomePageNew__halfgrid">
          <Callout
            title="Make a bet in...SECONDS"
            text={`The easiest way to make a sports bet.
                  Choose a team, choose an amount, game on!`}
            buttonText="Try premium for free"
          />
          <div className="HomePageNew__screenshot">
            <img src="https://storage.googleapis.com/wager-static-assets/site-static/homepage_screemshot1.png" />
          </div>
        </div>
        <div className="HomePageNew__halfgrid HomePageNew__halfgrid--reverse">
          <div className="HomePageNew__screenshot">
            <img src="https://storage.googleapis.com/wager-static-assets/site-static/homepage_screenshot2.png" />
          </div>
          <Callout
            title="Start a party! Go 1v1, 5v5, 100v1"
            text={`Go head to head against a friend. Or take all of your friends on 5v1. With a Wager party, you can bet against influencers and friends alike!!`}
            buttonText="Try premium for free"
          />
        </div>

        <Callout
          title="A Platform You Can Trust"
          styleName="Callout--single"
          text={`We believe life is better with a little skin in the game.
Everyone deserves to get in the game in a place you can trust with...
Best Price, no hidden fees, an even playing field, your interest first`}
          buttonText="Try premium for free"
        />

        <div className="HomePageNew__block">
          <div className="HomePageNew__block-text">{`I think people love Wager because it feels very community-oriented, I can see how Wager Games' organically creates, a community of people who bond over betting (which would spur friendly competition, personal bets/wagers between people, etc.).`}</div>
          <div className="HomePageNew__block-name">Matt Q.</div>
        </div>

        <Callout
          styleName={"Callout--single"}
          title="Why we started Wager..."
          text={""}
          buttonText="Try premium for free"
        >
          <p>
            {`Contrary to standard sports betting, marketing speak. Sports is
            about the people. It's not about the money or that fake dream that
            you could win a million dollars on a game. That stuff is fake
            lottery tickets and if that's what you want you won't find it
            here...`}
          </p>
          <p>
            {`We believe sports is about a people, a community of people, that
            have a love for their game and want to put a stake in the ground to
            prove it! They share their picks and thoughts with other fans and
            marvel around the beauty that is sports.`}
          </p>
          <p>
            {`We want to create a safe and social community for sports fans to
            share their picks, engage in games and get that feeling of what it's
            like to be in the game! There's no better feeling and now you can do
            it protected from casinos and big corporations.`}
          </p>
          <p>We hope you will join our community of passionate fans!</p>
          <p>-Kelson, Founder Wager Games</p>
        </Callout>
        <div>
          <div className="HomePageNew__quote-header">
            <div className="HomePageNew__quote-header-circle">
              <div className="HomePageNew__quote-header-circle-quote">{`"`}</div>
            </div>
            <div className="HomePageNew__header-text">What our</div>
            <div className="HomePageNew__header-text"> Fans Have to Say</div>
          </div>
        </div>
      </div>
      <div className="HomePageNew__cards">
        <div className="HomePageNew__card">
          <div className="HomePageNew__card-copy">
            {`"Easy and quick access to deposit and to withdraw, no questions asked and easy easy to withdraw winnings"`}
          </div>
        </div>
        <div className="HomePageNew__card">
          <div className="HomePageNew__card-copy">
            {`"More fun to bet with friends, better payouts than any casino, love how it tracks my bets."`}
          </div>
        </div>
        <div className="HomePageNew__card">
          <div className="HomePageNew__card-copy">
            {`“Social aspect. I prefer not losing money to random casinos and clearing houses! It's just a really fun place to be”`}
          </div>
        </div>
      </div>
      <div className="HomePageNew_footer">
        <div>© Wager Games Inc - All Rights Reserved.</div>
        <a href="/terms">Terms</a>
        <a href="/privacy_policy">Privacy Policy</a>
      </div>
    </>
  );
};

export default HomePageNew;
